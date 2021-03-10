import { shapeAllType, drawCoordinate } from './index'
import { getPointOnCanvas } from '../handle.common'
import { 
    drawRectDottedLineAnimation, 
    drawRect, 
    fillRect,
    drawRoundRect,
    fillRoundRect
} from './rect'
import { 
    drawEllipseDottedLineAnimation,
    drawEllipse, 
    fillEllipse 
} from './ellipse'
import { drawAcme } from './acme'
import { getPalette } from '../handle.palette'
import { pushStatus } from '../handle'

let 
    layerIndex: number,
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number,
    width: number,
    height: number
    
let shapeType: shapeAllType

let context: CanvasRenderingContext2D

let AnimationControl: number

const clear = () => {
    if(context) {
        context.clearRect(0, 0, width, height)
    }
}

export const useShape = () => {
    return {
        layerIndex,
        startX,
        startY,
        endX,
        endY,
        width,
        height,
        shapeType,
        context,
        setAnimationControl: (c: number) => AnimationControl = c,
        clear
    }
}

export function initShape(canvas: HTMLCanvasElement, index: number) {

    context = canvas.getContext('2d') as CanvasRenderingContext2D

    width = canvas.width
    height = canvas.height
    layerIndex = index

    // 鼠标移动
    const mousemove =  (event: MouseEvent) => {
        if(!shapeType) { return ; }

        let { x, y } = getPointOnCanvas(canvas, event.pageX, event.pageY)

        // FIX: 此处不可以使用节流函数优化执行效率!
        clear()
        move({
            sx: startX,
            sy: startY,
            ex: x,
            ey: y
        }, context, shapeType)
        
        endX = x
        endY = y
    }

    // 鼠标按下
    const mousedown = (event: MouseEvent) => {

        cancelAnimationFrame(AnimationControl)
        const { x, y } = getPointOnCanvas(canvas, event.pageX, event.pageY)
        canvas.addEventListener('mousemove', mousemove)

        startX = x
        startY = y
    }
    
    // 鼠标松开
    const mouseup = () => {

        getComputedStyle(canvas)
        up({
            sx: startX,
            sy: startY,
            ex: endX,
            ey: endY
        }, context, shapeType)
        
        canvas.removeEventListener('mousemove', mousemove)
    }

    const mouseenter = () => {
        canvas.addEventListener('mousedown', mousedown)
        canvas.addEventListener('mouseup', mouseup)
    }
    
    const mouseleave = () => {
        canvas.removeEventListener('mousedown', mousedown)
        canvas.removeEventListener('mouseup', mouseup)
    }
    
    canvas.addEventListener('mouseenter', mouseenter)
    canvas.addEventListener('mouseleave', mouseleave)

    document.addEventListener('keydown', (event) => {

        if(!shapeType) { return; }

        const nKeyCode = event.keyCode || event.which || event.charCode

        const isCtrl = event.ctrlKey || event.metaKey;
        const isAlt = event.altKey

        if(nKeyCode === 46 && isCtrl) { // Ctrl + delete 填充背景色

            if(shapeType === 'rect dottedLine') {
                
                let background = getPalette('background') as string

                fillRect(context, {
                    sx: startX,
                    sy: startY,
                    ex: endX,
                    ey: endY
                }, background)

                pushStatus(layerIndex, {
                    type: 'rect',
                    position: {
                        sx: startX,
                        sy: startY,
                        ex: endX,
                        ey: endY
                    },
                    positionFill: background,
                })
            }

            if(shapeType === 'ellipse dottedLine') {
                
                let background = getPalette('background') as string

                fillEllipse(
                    context, 
                    {
                        sx: startX,
                        sy: startY,
                        ex: endX,
                        ey: endY
                    }, 
                    background
                )

                pushStatus(layerIndex, {
                    type: 'ellipse',
                    position: {
                        sx: startX,
                        sy: startY,
                        ex: endX,
                        ey: endY
                    },
                    positionFill: background,
                })
            }
            
        }

        if(nKeyCode === 46 && isAlt) {

            // Alt + delete 填充前景色
            let foreground = getPalette('foreground') as string

            fillRect(context, {
                sx: startX,
                sy: startY,
                ex: endX,
                ey: endY
            }, foreground)

            pushStatus(layerIndex, {
                type: 'rect',
                position: {
                    sx: startX,
                    sy: startY,
                    ex: endX,
                    ey: endY
                },
                positionFill: foreground,
            })
        }
    })
}

export function setShapeType(type: shapeAllType) {
    shapeType = type
}

const cacheRadius = (function (){
    let radius: number = 0
    let maxRadius = 10
    return {
        set: (s: number, e: number) => {
            radius = Math.abs(s - e) / 3
            return radius > maxRadius ? maxRadius : radius
        },
        get: () => radius > maxRadius ? maxRadius : radius
    }
})()

function move(
    coordinate: drawCoordinate,
    context: CanvasRenderingContext2D,
    type: shapeAllType
){

    switch(type) {
        case 'rect fullLine' :
            // 实线矩形
            drawRect(coordinate, context, 'fullLine')
            break;
        case 'rect dottedLine' :
            drawRect(coordinate, context, 'dottedLine')
            // 虚线矩形
            break;
        case 'rect fillet fullLine' :
            drawRoundRect(context, coordinate, cacheRadius.set(coordinate.sx, coordinate.ex));
            // 实线圆角矩形
            break;
        case 'polygon fullLine' :
            // 实线多边形
            break;
        case 'line fullLine' :
            // 直线
            break;
        case 'ellipse fullLine' :
            // 实线椭圆形
            drawEllipse(coordinate, context, 'fullLine')
            break;
        case 'ellipse dottedLine' :
            drawEllipse(coordinate, context, 'dottedLine')
            // 虚线椭圆形
            break;
        default :
            return console.error(`is not type class`)
    }
}

function up(
    coordinate: drawCoordinate,
    context: CanvasRenderingContext2D,
    type: shapeAllType
){
    const { sx, sy, ex, ey } = coordinate;
    let background = getPalette('background') as string
    switch(type) {
        case 'rect fullLine' :
            // 实线矩形
            // 填充前景色
            fillRect(context, coordinate, background)
            // 绘制顶点
            drawAcme(context, 
                [
                    { x: sx, y: sy },
                    { x: sx, y: ey },
                    { x: ex, y: sy },
                    { x: ex, y: ey }
                ]
            )
            // 保存矩形信息
            pushStatus(layerIndex, {
                type: 'rect',
                position: coordinate,
                positionFill: background,
            })
            break;
        case 'rect dottedLine' :
            drawRectDottedLineAnimation()
            // 虚线矩形
            break;
        case 'rect fillet fullLine' :
            let r = cacheRadius.get()
            fillRoundRect(context, coordinate, r, background)
            if(ex < sx) {
                r *= -1
            }
            drawAcme(context, 
                [
                    { x: sx + r, y: sy },
                    { x: sx, y: sy + r },
                    { x: ex - r, y: sy },
                    { x: ex, y: sy + r },
                    { x: sx + r, y: ey },
                    { x: sx, y: ey - r },
                    { x: ex - r, y: ey },
                    { x: ex, y: ey - r },
                ]
            )
            // 实线圆角矩形
            break;
        case 'polygon fullLine' :
            // 实线多边形
            break;
        case 'line fullLine' :
            // 直线
            break;
        case 'ellipse fullLine' :
            // 实线椭圆形
            fillEllipse(context, coordinate, background)

            drawAcme(context, 
                [
                    { x: ((ex - sx) / 2) + sx, y: sy },
                    { x: ((ex - sx) / 2) + sx, y: ey },
                    { x: sx, y: ((ey - sy) / 2) + sy },
                    { x: ex, y: ((ey - sy) / 2) + sy },
                ]
            )
            break;
        case 'ellipse dottedLine' :
            drawEllipseDottedLineAnimation()
            // 虚线椭圆形
            break;
        default :
            return console.error(`is not type class`)
    }
}