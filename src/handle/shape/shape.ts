import { shapeAllType, drawCoordinate } from './index'
import { getPointOnCanvas } from '../handle.common'
import { drawRectDottedLineAnimation, drawRect, fillRect } from './rect'
import { drawEllipseDottedLineAnimation, drawEllipse, fillEllipse } from './ellipse'
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

    let timer: number | null
    let STATUS: string

    // 鼠标移动
    const mousemove =  (event: MouseEvent) => {
        if(!shapeType) { return ; }

        let { x, y } = getPointOnCanvas(canvas, event.pageX, event.pageY)

        // 此处不可以使用节流函数优化执行效率!

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

        STATUS = 'DWON'

        cancelAnimationFrame(AnimationControl)

        const { x, y } = getPointOnCanvas(canvas, event.pageX, event.pageY)

        canvas.addEventListener('mousemove', mousemove)

        startX = x
        startY = y
    }
    
    // 鼠标松开
    const mouseup = () => {
        STATUS = 'UP'
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

                // TODO: 将状态保存在绘制队列中
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
    switch(type) {
        case 'rect fullLine' :
            // 实线矩形
            const { sx, sy, ex, ey } = coordinate;
            drawAcme(context, 
                [
                    { x: sx, y: sy },
                    { x: sx, y: ey },
                    { x: ex, y: sy },
                    { x: ex, y: ey }
                ]
            )
            break;
        case 'rect dottedLine' :
            drawRectDottedLineAnimation()
            // 虚线矩形
            break;
        case 'rect fillet fullLine' :
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

            break;
        case 'ellipse dottedLine' :
            drawEllipseDottedLineAnimation()
            // 虚线椭圆形
            break;
        default :
            return console.error(`is not type class`)
    }
}