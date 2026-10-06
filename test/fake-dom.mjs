/**
 * A minimal document double for the module tests.
 *
 * The browser half touches very little of the DOM: a `<style>` it appends to `head`,
 * a body whose attributes it reads and writes, a band it appends beside `#root`, and
 * inline custom properties. `jsdom` is not a dependency of this plugin package, and
 * pulling one in to observe a handful of properties would cost more than it proves.
 *
 * The double models the browser behaviours the skin depends on, all of which were
 * measured rather than assumed:
 *
 * 1. **Every attribute write records, even one that rewrites the value already
 *    held** (`setAttribute('data-a', 'on')` over an existing `on` records). This is
 *    what makes an observer whose callback re-asserts its own watched attribute
 *    re-arm itself forever and starve the page's event loop, and it is why the
 *    applier writes only on a change.
 * 2. **Appending and removing children records too**, so a child-list branch can be
 *    driven the same way.
 * 3. **`subtree` means what it says**, and `attributeFilter` narrows an attribute
 *    record to the names it lists.
 * 4. **Records are delivered after the current turn, and a write made from a
 *    callback is delivered on the next turn.** `flush()` therefore runs to
 *    quiescence like the real observer, bounded so a self-re-arming callback fails
 *    the test instead of hanging it.
 *
 * The selector engine understands one compound selector at a time (`tag`,
 * `#id`, `.class`, `[attr]`, `[attr="value"]`, in any combination) and descendant
 * combinators between them. That is exactly what this plugin's modules and tests
 * ask for, and no more.
 */

/** Attribute presence/equality and class/tag/id tests, one compound selector. */
function matchesCompound(element, compound) {
  const pattern = /^([a-zA-Z][\w-]*)?((?:[.#][\w-]+|\[[^\]]+\])*)$/u
  const match = pattern.exec(compound)
  if (match === null) throw new Error(`fake-dom: unsupported selector "${compound}"`)
  const [, tag, rest] = match
  if (tag !== undefined && tag !== '' && element.tagName !== tag.toLowerCase()) return false
  const parts = rest === undefined ? [] : rest.match(/[.#][\w-]+|\[[^\]]+\]/gu) ?? []
  for (const part of parts) {
    if (part.startsWith('#')) {
      if (element.getAttribute('id') !== part.slice(1)) return false
      continue
    }
    if (part.startsWith('.')) {
      const classes = (element.getAttribute('class') ?? '').split(/\s+/u)
      if (!classes.includes(part.slice(1))) return false
      continue
    }
    const body = part.slice(1, -1)
    const equals = /^([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')$/u.exec(body)
    if (equals !== null) {
      const wanted = equals[2] ?? equals[3]
      if (element.getAttribute(equals[1]) !== wanted) return false
      continue
    }
    if (!element.hasAttribute(body.trim())) return false
  }
  return true
}

/**
 * Whether one element matches a selector, descendant combinators included.
 * @param element - candidate.
 * @param selector - selector text.
 * @returns true on a match.
 */
export function matchesSelector(element, selector) {
  const compounds = selector.trim().split(/\s+/u)
  const last = compounds[compounds.length - 1]
  if (!matchesCompound(element, last)) return false
  let at = compounds.length - 2
  let node = element.parentElement
  while (at >= 0) {
    if (node === null) return false
    if (matchesCompound(node, compounds[at])) at -= 1
    node = node.parentElement
  }
  return true
}

/** One recorded custom-property write. */
class InlineStyle {
  constructor() {
    this.properties = new Map()
    this.removals = []
  }

  setProperty(name, value) {
    this.properties.set(name, String(value))
  }

  removeProperty(name) {
    this.removals.push(name)
    this.properties.delete(name)
  }

  /** @returns the value of one custom property, or undefined. */
  get(name) {
    return this.properties.get(name)
  }
}

/** One element with the attribute, style, child and query surface these modules use. */
export class FakeElement {
  constructor(tagName, doc) {
    this.tagName = tagName.toLowerCase()
    this.ownerDocument = doc
    this.attributes = new Map()
    this.style = new InlineStyle()
    this.children = []
    this.parentElement = null
    this.textContent = ''
  }

  /* `id` and `className` are the reflected forms of the attributes of the same name:
     assigning the property writes the attribute, the way a real element behaves.
     Keeping them as plain own fields would let a module set `.id` and leave
     `getElementById` looking at an empty attribute. */
  get id() {
    return this.getAttribute('id') ?? ''
  }

  set id(value) {
    this.setAttribute('id', value)
  }

  get className() {
    return this.getAttribute('class') ?? ''
  }

  set className(value) {
    this.setAttribute('class', value)
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value))
    this.ownerDocument.record(this, name)
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null
  }

  hasAttribute(name) {
    return this.attributes.has(name)
  }

  removeAttribute(name) {
    if (!this.attributes.has(name)) return
    this.attributes.delete(name)
    this.ownerDocument.record(this, name)
  }

  appendChild(child) {
    child.parentElement = this
    this.children.push(child)
    this.ownerDocument.recordChildren(this, [child])
    return child
  }

  /** Append one or more children, as `Element.append` does. */
  append(...nodes) {
    for (const node of nodes) this.appendChild(node)
  }

  /**
   * Whether this element contains a node, itself included.
   * @param node - candidate descendant.
   * @returns true when the node is this element or below it.
   */
  contains(node) {
    if (node === this) return true
    return this.children.some(child => child.contains?.(node) === true)
  }

  /** Every descendant, in document order, this element excluded. */
  descendants() {
    const found = []
    for (const child of this.children) {
      found.push(child, ...child.descendants())
    }
    return found
  }

  /** @returns the first descendant-or-self matching a selector, or null. */
  querySelector(selector) {
    if (matchesSelector(this, selector)) return this
    return this.descendants().find(node => matchesSelector(node, selector)) ?? null
  }

  /** @returns every descendant-or-self matching a selector, in document order. */
  querySelectorAll(selector) {
    const found = this.descendants().filter(node => matchesSelector(node, selector))
    if (matchesSelector(this, selector)) found.unshift(this)
    return found
  }

  remove() {
    const parent = this.parentElement
    if (parent === null) return
    const at = parent.children.indexOf(this)
    if (at !== -1) parent.children.splice(at, 1)
    this.parentElement = null
    this.ownerDocument.recordChildren(parent, [])
  }
}

/** The document double handed to the modules under test. */
class FakeDocument {
  constructor() {
    this.documentElement = new FakeElement('html', this)
    this.head = new FakeElement('head', this)
    this.body = new FakeElement('body', this)
    this.documentElement.append(this.head, this.body)
    this.observers = []
    /** Mutations not yet delivered, as `{ type, target, attributeName, addedNodes }`. */
    this.records = []
    /** How many batches the last `flush()` delivered. */
    this.callbacks = 0
    this.recording = true
  }

  createElement(tagName) {
    return new FakeElement(tagName, this)
  }

  getElementById(id) {
    return this.documentElement.querySelector(`#${id}`)
  }

  querySelector(selector) {
    return this.documentElement.querySelector(selector)
  }

  querySelectorAll(selector) {
    return this.documentElement.querySelectorAll(selector)
  }

  /**
   * Note one attribute mutation for delivery, the way the browser queues a record.
   *
   * Every write is recorded, including one that rewrites the value already held:
   * that is the behaviour an idempotent writer has to survive.
   * @param target - element that was written.
   * @param name - attribute name.
   */
  record(target, name) {
    if (!this.recording) return
    this.records.push({ type: 'attributes', target, attributeName: name, addedNodes: [] })
  }

  /**
   * Note one child-list mutation for delivery.
   * @param target - element whose children changed.
   * @param added - nodes that were added by this mutation.
   */
  recordChildren(target, added) {
    if (!this.recording) return
    this.records.push({ type: 'childList', target, attributeName: null, addedNodes: added })
  }

  /**
   * Deliver pending records until none remain, as the browser eventually does.
   * @param limit - batches allowed before the run is called a non-terminating loop;
   * a callback that re-arms its own observer exceeds it.
   * @throws when the limit is reached, naming the condition.
   */
  flush(limit = 200) {
    this.recording = false
    this.callbacks = 0
    try {
      while (this.records.length > 0) {
        if (this.callbacks >= limit) {
          throw new Error(`fake-dom: observer callbacks did not terminate after ${limit} passes`)
        }
        const batch = this.records.splice(0)
        this.callbacks += 1
        for (const observer of [...this.observers]) {
          const delivered = batch.filter(record => observer.watches(record))
          if (delivered.length > 0) observer.callback(delivered, observer)
        }
      }
    } finally {
      this.records = []
      this.recording = true
    }
  }
}

/**
 * Build a document double whose global `MutationObserver` records registrations.
 * @returns the document, with `flush()` and `observers` for the test.
 */
export function createFakeDocument() {
  const doc = new FakeDocument()
  const RealObserver = globalThis.MutationObserver
  // The modules construct `new MutationObserver(...)`; the double keeps the callback
  // and its options so the test can drive delivery.
  globalThis.MutationObserver = class {
    constructor(callback) {
      this.callback = callback
      this.attributeFilter = []
      this.attributes = false
      this.childList = false
      this.subtree = false
      this.target = null
    }

    observe(target, options = {}) {
      this.target = target
      this.attributes = options.attributes === true
      this.childList = options.childList === true
      this.subtree = options.subtree === true
      this.attributeFilter = options.attributeFilter ?? []
      doc.observers.push(this)
    }

    /** @returns whether this observer asked for the mutation on record. */
    watches(record) {
      const related = this.target === record.target
        || (this.subtree === true && this.target?.contains(record.target) === true)
      if (!related) return false
      if (record.type === 'childList') return this.childList
      if (!this.attributes) return false
      return this.attributeFilter.length === 0 || this.attributeFilter.includes(record.attributeName)
    }

    disconnect() {
      const at = doc.observers.indexOf(this)
      if (at !== -1) doc.observers.splice(at, 1)
    }
  }
  doc.restore = () => {
    if (RealObserver === undefined) delete globalThis.MutationObserver
    else globalThis.MutationObserver = RealObserver
  }
  return doc
}

/**
 * Build a body with the shell the modules expect, ready to be skinned.
 * @param doc - the document double.
 * @returns the body element.
 */
export function withShell(doc) {
  const root = doc.createElement('div')
  root.id = 'root'
  doc.body.appendChild(root)
  return doc.body
}
