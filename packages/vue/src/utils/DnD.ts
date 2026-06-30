/**
 * 拖拽排序类。
 *
 * 用于处理列表元素的拖拽排序，支持自动滚动、拖拽手柄和禁止跨层级排序。
 */
type IDType<T> = T extends number | string ? T : never

interface DnDOptions<T> {
  onReorder: (ids: IDType<T>[]) => void
  onDrop?: (oldIndex: number, newIndex: number) => void
  allowNesting?: boolean
  handle?: string
}

export class DnD<T> {
  private elRef: HTMLElement | null = null
  private onReorder: (ids: IDType<T>[]) => void
  private onDrop?: (oldIndex: number, newIndex: number) => void
  private sourceEl: HTMLElement | null = null
  private list: HTMLElement | null = null
  private allowNesting: boolean
  private scrollThreshold: number = 50
  private scrollInterval: number | null = null
  private maxScrollSpeed: number = 20
  private scrollAcceleration: number = 0.2
  private currentScrollSpeed: { x: number; y: number } = { x: 0, y: 0 }
  private isAnimating: boolean = false
  private oldIndex: number | null = null
  private handle?: string
  private lastMouseDownTarget: HTMLElement | null = null

  constructor(elRef: HTMLElement | null, options: DnDOptions<T> = {} as DnDOptions<T>) {
    this.elRef = elRef
    this.onReorder = options.onReorder
    this.onDrop = options.onDrop
    this.allowNesting = options.allowNesting ?? true
    this.handle = options.handle
  }

  private onMouseDown = (e: MouseEvent): void => {
    this.lastMouseDownTarget = e.target as HTMLElement
  }

  private onDragStart = (e: DragEvent): void => {
    if (!e.target || !(e.target instanceof HTMLElement)) return

    if (this.handle && this.lastMouseDownTarget && !this.lastMouseDownTarget.closest(this.handle)) {
      e.preventDefault()
      return
    }

    this.sourceEl = e.target.closest('li')
    if (!this.sourceEl) return

    const items = Array.from(this.sourceEl.parentElement?.children || [])
    this.oldIndex = items.indexOf(this.sourceEl)

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
    }

    requestAnimationFrame(() => {
      this.sourceEl?.classList.add('dragging')
    })
    e.stopPropagation()
  }

  private handleScroll(e: DragEvent): void {
    const container = document.querySelector('.ps')
    if (!container || !(container instanceof HTMLElement)) return

    const containerRect = container.getBoundingClientRect()
    const topThreshold = containerRect.top + this.scrollThreshold
    const bottomThreshold = containerRect.bottom - this.scrollThreshold
    const leftThreshold = containerRect.left + this.scrollThreshold
    const rightThreshold = containerRect.right - this.scrollThreshold

    if (this.scrollInterval) {
      clearInterval(this.scrollInterval)
    }

    this.scrollInterval = window.setInterval(() => {
      let scrollX = 0
      let scrollY = 0

      if (e.clientY < topThreshold) {
        const distance = Math.max(0, topThreshold - e.clientY)
        this.currentScrollSpeed.y -= this.scrollAcceleration * distance
        scrollY = Math.max(-this.maxScrollSpeed, this.currentScrollSpeed.y)
      } else if (e.clientY > bottomThreshold) {
        const distance = Math.max(0, e.clientY - bottomThreshold)
        this.currentScrollSpeed.y += this.scrollAcceleration * distance
        scrollY = Math.min(this.maxScrollSpeed, this.currentScrollSpeed.y)
      } else {
        this.currentScrollSpeed.y = 0
      }

      if (e.clientX < leftThreshold) {
        const distance = Math.max(0, leftThreshold - e.clientX)
        this.currentScrollSpeed.x -= this.scrollAcceleration * distance
        scrollX = Math.max(-this.maxScrollSpeed, this.currentScrollSpeed.x)
      } else if (e.clientX > rightThreshold) {
        const distance = Math.max(0, e.clientX - rightThreshold)
        this.currentScrollSpeed.x += this.scrollAcceleration * distance
        scrollX = Math.min(this.maxScrollSpeed, this.currentScrollSpeed.x)
      } else {
        this.currentScrollSpeed.x = 0
      }

      container.scrollBy(scrollX, scrollY)

      if (scrollX === 0 && scrollY === 0 && this.scrollInterval) {
        clearInterval(this.scrollInterval)
      }
    }, 16)
  }

  private onDragOver = (e: DragEvent): void => {
    e.preventDefault()
    this.handleScroll(e)

    if (!this.sourceEl || this.isAnimating || !e.target || !(e.target instanceof HTMLElement)) return

    const targetEl = e.target.closest('li')
    if (!targetEl || !targetEl.draggable || this.sourceEl.contains(targetEl) || targetEl === this.sourceEl) return
    if (!this.allowNesting && targetEl.parentElement !== this.sourceEl.parentElement) return
    if (targetEl.dataset.type !== this.sourceEl.dataset.type) return

    const itemsEl = Array.from(targetEl.parentElement?.children || [])
    const sourceIndex = itemsEl.indexOf(this.sourceEl)
    const targetIndex = itemsEl.indexOf(targetEl)
    const moveTarget = targetIndex > sourceIndex ? targetEl.nextElementSibling : targetEl

    if (moveTarget !== this.sourceEl && moveTarget !== this.sourceEl.nextElementSibling) {
      const oldTop = targetEl.getBoundingClientRect().top
      targetEl.parentElement?.insertBefore(this.sourceEl, moveTarget)
      const newTop = targetEl.getBoundingClientRect().top
      const offset = oldTop - newTop
      this.isAnimating = true

      targetEl.animate([{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0px)' }], {
        duration: 80,
        easing: 'ease-in-out'
      }).onfinish = () => {
        this.isAnimating = false
      }
    }
  }

  private onDragEnd = (): void => {
    if (!this.sourceEl) return

    this.sourceEl.classList.remove('dragging')

    if (this.scrollInterval) {
      clearInterval(this.scrollInterval)
    }

    const items = Array.from(this.sourceEl.parentElement?.children || [])
    const ids = items.map((item) => (item instanceof HTMLElement ? item.dataset.id || '' : '')).filter(Boolean)
    const newIndex = items.indexOf(this.sourceEl)

    this.onReorder(ids as IDType<T>[])

    if (this.onDrop && this.oldIndex !== null) {
      this.onDrop(this.oldIndex, newIndex)
    }

    this.sourceEl = null
    this.oldIndex = null
  }

  public init(): void {
    this.list = this.elRef
    if (!this.list) return

    this.list.addEventListener('mousedown', this.onMouseDown)
    this.list.addEventListener('dragstart', this.onDragStart)
    this.list.addEventListener('dragover', this.onDragOver)
    this.list.addEventListener('dragend', this.onDragEnd)
  }

  public destroy(): void {
    if (!this.list) return

    this.list.removeEventListener('mousedown', this.onMouseDown)
    this.list.removeEventListener('dragstart', this.onDragStart)
    this.list.removeEventListener('dragover', this.onDragOver)
    this.list.removeEventListener('dragend', this.onDragEnd)

    if (this.scrollInterval) {
      clearInterval(this.scrollInterval)
    }
  }
}
