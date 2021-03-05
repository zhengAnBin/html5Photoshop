type style = {
    fillStyle?: string
}

// 所有图层队列
const layerQueue: {
    currentContext: CanvasRenderingContext2D
    currentLayer: HTMLCanvasElement
    index: number
    children?: {
        type: string
        style?: style
    }[]
}[] = []

// 当前图层
const currentLayer = {

}

// 当前图层的渲染队列
const currentLayerQueue = []

/**
 * 唯一标识
 */
let endIndex = 0

let canvas: HTMLCanvasElement

/**
 * 添加图层
 */
function addLayer() {
    
}

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

function createLayer(
    width: number, 
    height: number, 
    type: bgType, 
    container: HTMLElement
){
    
    const layer = document.createElement('canvas') as HTMLCanvasElement
    const context = layer.getContext('2d') as CanvasRenderingContext2D
    const index = endIndex

    layer.width = width
    layer.height = height
    layer.style.background = type
    
    coverInQueue(layer, context, index)
    endIndex ++;

    // 渲染背景
    // renderBG(context, width, height, type)
    
    // 加入图层队列
    pushChildren(index, 'bg', { fillStyle: type })

    // 添加到容器中
    container.appendChild(layer)

    layer.className = 'center-layer'

    return {
        layer,
        context,
        index
    }
}

/**
 * 添加绘制
 */
export function pushChildren(index: number, type: string, style: style){
    let pushed = layerQueue[index]
    if(pushed && pushed.children) {
        pushed.children.push({
            type,
            style: Object.assign(style)
        })
    }
}

export { createLayer }

export function renderLayer(){
    let 
        children, 
        currentLayer: HTMLCanvasElement, 
        currentContext: CanvasRenderingContext2D

    layerQueue.forEach(layer => {
        children = layer.children
        currentLayer = layer.currentLayer
        currentContext = layer.currentContext
        if(children) {
            children.forEach(c => {
                if(c.type === 'bg') {
                    renderBG(currentContext, currentLayer.width, currentLayer.height, '#FFFFFF')
                }
            })
        }
    })

}

function coverInQueue(layer: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number){
    layerQueue.push({
        currentContext: context,
        currentLayer: layer,
        index,
        children: []
    })
}

function renderBG(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    fillStyle: string
){
    context.fillStyle = fillStyle;
    context.fillRect(0, 0, width, height)
}