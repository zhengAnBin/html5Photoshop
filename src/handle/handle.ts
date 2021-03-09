import { cloneDeep } from './handle.common'
import { fillRect, fillEllipse } from './handle.shape'
/**
 * 图层移动
 */
function moveLayer(){

}

/**
 * 保存所有图层
 */
function saveAllLayer(){

}

/**
 * Ctrl + z 回撤
 */

function revokeLayer(){

}

/**
 * 创建场景
 */
export type bgType = 'white' | 'black' | 'transparent'

let documents = []

export interface currentLayer {
    zindex: number
    layers?: {
        zindex: number
        canvas: HTMLCanvasElement
        status: {
            type: 'rect' | 'ellipse',
            position: any,
            positionFill: string
        }[]
    }[]
}

let currentLayer: currentLayer | undefined

/**
 * 重载当前图层
 */
export function reRender(){
    currentLayer?.layers?.forEach(l => {
        if(l.status.length === 0) { return }
        let context = l.canvas.getContext('2d') as CanvasRenderingContext2D
        l.status.forEach(s => {
            switch(s.type) {
                case 'rect':
                    fillRect(context, s.position, s.positionFill)
                    break;
                case 'ellipse':
                    fillEllipse(context, s.position, s.positionFill)
                    break;
                default:
                    return ''
            }
        })
    })
}

/**
 * 创建图层
 * @param width 
 * @param height 
 * @param type 
 * @param container 
 */
export function createLayer(
    width: number, 
    height: number, 
    type: bgType, 
    container: HTMLElement
){
    // 创建一个canvas html元素
    const layer = document.createElement('canvas') as HTMLCanvasElement

    const zindex = documents.length === 0 ? 0 : documents.length - 1

    // 设置宽高
    layer.width = width
    layer.height = height

    // 设置背景色
    layer.style.background = type

    // 保存为当前图层
    let currentLayerInfo = {
        zindex: zindex,
        layers: [{
            zindex: 0,
            canvas: layer,
            status: []
        }]
    }

    // TODO: cloneDeep
    currentLayer = currentLayerInfo

    // 添加到全局窗口中
    documents.push(currentLayerInfo)

    // 添加到画布中
    container.appendChild(layer)

    // 并且设置居中显示
    layer.className = 'center-layer'

    return {
        layer,
        layerIndex: 0
    }
}

/**
 * 添加的图层都是透明的
 */
export function addLayer() {

}

/**
 * 将状态保存在当前文档中的某一个图层
 */
export function pushStatus(zindex: number, style: any){
    if(currentLayer && currentLayer.layers) {
        currentLayer.layers[zindex].status.push(style)
        // if(currentLayer.layers.length <= zindex && zindex >= 0) {
        //     console.log('yes')
        //     console.log(currentLayer.layers[zindex])
        //     currentLayer.layers[zindex].status.push(style)
        // }
    }
}