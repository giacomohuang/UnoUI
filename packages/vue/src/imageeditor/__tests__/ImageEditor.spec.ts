import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ImageEditorExpose } from '..'
import ImageEditor from '../ImageEditor.vue'

const cropperMocks = vi.hoisted(() => {
  const instances: MockCropper[] = []

  class MockCropper {
    data = { x: 10, y: 20, width: 80, height: 60, rotate: 0, scaleX: 1, scaleY: 1 }
    options: Cropper.Options<HTMLImageElement>
    destroy = vi.fn()
    disable = vi.fn()
    enable = vi.fn()
    zoom = vi.fn()
    rotate = vi.fn((degrees: number) => {
      this.data.rotate += degrees
    })
    reset = vi.fn()
    setAspectRatio = vi.fn()
    setData = vi.fn((data: Cropper.SetDataOptions) => {
      this.data = { ...this.data, ...data }
    })
    getData = vi.fn(() => ({ ...this.data }))
    getCroppedCanvas = vi.fn(() => ({
      width: 320,
      height: 180,
      toBlob: (callback: BlobCallback) => callback(new Blob(['image'], { type: 'image/png' })),
      toDataURL: () => 'data:image/png;base64,aW1hZ2U='
    }))

    constructor(_element: HTMLImageElement, options: Cropper.Options<HTMLImageElement>) {
      this.options = options
      instances.push(this)
      queueMicrotask(() => options.ready?.({} as Cropper.ReadyEvent<HTMLImageElement>))
    }
  }

  return { instances, MockCropper }
})

vi.mock('cropperjs', () => ({ default: cropperMocks.MockCropper }))

describe('ImageEditor', () => {
  beforeEach(() => {
    cropperMocks.instances.length = 0
  })

  it('initializes the cropper with an aspect ratio and exposes toolbar actions', async () => {
    const wrapper = mount(ImageEditor, {
      props: {
        src: '/photo.jpg',
        aspectRatio: 16 / 9,
        zoomStep: 0.2
      }
    })
    await flushPromises()

    const instance = cropperMocks.instances[0]
    expect(instance.options.aspectRatio).toBe(16 / 9)
    expect(wrapper.emitted('ready')).toHaveLength(1)

    await wrapper.find('button[aria-label="放大"]').trigger('click')
    await wrapper.find('button[aria-label="向左旋转"]').trigger('click')

    expect(instance.zoom).toHaveBeenCalledWith(0.2)
    expect(instance.rotate).toHaveBeenCalledWith(-90)
  })

  it('enforces minimum source dimensions while preserving a fixed ratio', async () => {
    const wrapper = mount(ImageEditor, {
      props: {
        src: '/photo.jpg',
        aspectRatio: 4 / 3,
        minWidth: 240,
        minHeight: 200
      }
    })
    await flushPromises()

    const instance = cropperMocks.instances[0]
    const exposed = wrapper.vm as unknown as ImageEditorExpose
    const data = exposed.getData()

    expect(instance.setData).toHaveBeenCalled()
    expect(data?.width).toBeCloseTo(800 / 3)
    expect(data?.height).toBeCloseTo(200)
  })

  it('returns and emits the cropped blob, data URL and dimensions', async () => {
    const wrapper = mount(ImageEditor, {
      props: {
        src: '/photo.jpg',
        minWidth: 120,
        minHeight: 90
      }
    })
    await flushPromises()

    const result = await (wrapper.vm as unknown as ImageEditorExpose).crop()

    expect(result.blob).toBeInstanceOf(Blob)
    expect(result.dataUrl).toContain('data:image/png')
    expect(result.width).toBe(320)
    expect(result.height).toBe(180)
    expect(wrapper.emitted('crop')?.[0]?.[0]).toEqual(result)
  })

  it('disables both cropper interaction and toolbar controls', async () => {
    const wrapper = mount(ImageEditor, {
      props: {
        src: '/photo.jpg',
        disabled: true
      }
    })
    await flushPromises()

    expect(cropperMocks.instances[0].disable).toHaveBeenCalled()
    expect(wrapper.findAll('button').every((button) => button.attributes('disabled') !== undefined)).toBe(true)

    await wrapper.setProps({ disabled: false })
    expect(cropperMocks.instances[0].enable).toHaveBeenCalled()
  })
})
