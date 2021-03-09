/**
 * 矩形工具
 */
import { getPointOnCanvas, cloneDeep } from './handle.common'
import { getPalette } from './handle.palette'
import { pushStatus, reRender } from './handle'
import { currentLayer } from './handle'

/**
 * 在 Photoshop 中矩形有两种
 * 一种是矩形选框工具
 * 一种是矩形工具
 */

/**
 * fullLine = 实线
 * dottedLine = 虚线
 */
type shapeAllType = 
    'rect fullLine' | 
    'rect dottedLine' |
    'ellipse fullLine' | 
    'ellipse dottedLine' | 
    'rect fillet fullLine' |
    'polygon fullLine' |
    'line fullLine'

type lineType = 'fullLine' | 'dottedLine'

/**
 * sx 起点x坐标,
 * sy 起点y坐标,
 * ex 终点x坐标,
 * ey 终点y坐标,
 */
export type drawCoordinate = {
    sx: number
    sy: number
    ex: number
    ey: number
}

let 
    layerIndex: number,

    startX: number, 
    startY: number, 
    endX: number, 
    endY: number,

    width: number,
    height: number

let shapeType: shapeAllType

export function setShapeType(type: shapeAllType) {
    shapeType = type
}

export function initShape(canvas: HTMLCanvasElement, index: number) {

    const context = canvas.getContext('2d') as CanvasRenderingContext2D

    width = canvas.width
    height = canvas.height
    layerIndex = index

    let timer: number | null

    // 鼠标移动
    const mousemove =  (event: MouseEvent) => {
        if(!shapeType) { return ; }

        let { x, y } = getPointOnCanvas(canvas, event.pageX, event.pageY)

        if(!timer) {
            timer = setTimeout(() => {
                context.clearRect(0, 0, width, height)
                move({
                    sx: startX,
                    sy: startY,
                    ex: x,
                    ey: y
                }, context, shapeType)
                clearTimeout(timer as number)
                timer = null
            }, 20)
        }
        
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
        if(shapeType === 'rect dottedLine') {
            // 动态虚线矩形
            drawRectDottedLineAnimation(context)
        } else if(shapeType === 'ellipse dottedLine') {
            // 动态虚线椭圆形
            drawEllipseDottedLineAnimation(context)
        }
        
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
                context.fillStyle = background
                context.fillRect(
                    startX, 
                    startY, 
                    (endX - startX), 
                    (endY - startY)
                )

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
                
                const { x, y, radiusX, radiusY } = ellipseCircle({
                    sx: startX,
                    sy: startY,
                    ex: endX,
                    ey: endY
                })
                
                let background = getPalette('background') as string

                context.beginPath()
                context.fillStyle = background
                context.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI)
                context.fill()

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

            context.fillStyle = foreground

            context.fillRect(
                startX, 
                startY, 
                (endX - startX), 
                (endY - startY)
            )
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

/**
 * 矩形填充颜色
 */
export function fillRect(
    context: CanvasRenderingContext2D, 
    coordinate: drawCoordinate, 
    color: string
) {
    const { sx, sy, ex, ey } = coordinate
    context.beginPath()
    context.fillStyle = color
    context.fillRect(sx, sy, (ex - sx), (ey - sy))
    context.closePath()
}

/**
 * 椭圆形填充颜色
 */
export function fillEllipse(
    context: CanvasRenderingContext2D, 
    coordinate: drawCoordinate, 
    color: string
){
    const { x, y, radiusX, radiusY } = ellipseCircle(coordinate)
    context.beginPath()
    context.fillStyle = color
    context.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI)
    context.fill()
    context.closePath()
}

/**
 * 
 * @param coordinate 坐标
 * @param context canvas 上下文
 * @param type 绘制类型
 */
export function drawRect(
    coordinate: drawCoordinate,
    context: CanvasRenderingContext2D,
    type: lineType
){
    reRender()
    if(type === 'fullLine') {
        drawRectFullLine(context, coordinate)
    } else if(type === 'dottedLine') {
        drawRectDottedLine(context, coordinate)
    } else {
        console.error(` is not draw type `)
    }
}

/**
 * 实线矩形工具
 * @param context 
 * @param coordinate 
 */
function drawRectFullLine(context: CanvasRenderingContext2D, coordinate: drawCoordinate){
    const { sx, sy, ex, ey } = coordinate
    context.beginPath();
    context.strokeRect(sx, sy, ex - sx, ey - sy);
    // TODO: 获取前景色色板并且进行填充
    context.strokeStyle = getPalette('background') as string
    context.fill()
    context.closePath();
}

/**
 * 虚线选框工具
 * @param context 
 * @param coordinate 
 */
function drawRectDottedLine(context: CanvasRenderingContext2D, coordinate: drawCoordinate){
    
    const { sx, sy, ex, ey } = coordinate

    context.beginPath()

    // left
    drawRectDottedLineToVertical(sx, sy, ey, context)
    // bottom
    drawRectDottedLineToHorizontal(sx, ey, ex, context)

    // right
    drawRectDottedLineToVertical(ex, sy, ey, context)
    // top
    drawRectDottedLineToHorizontal(sx, sy, ex, context)

    endX = ex
    endY = ey

    context.closePath()
}

// 动态虚线的运动初始值
let baseSpeed = 0, speed = 0.1

// 虚线的间隔
const dottedLineBase = 4

/**
 * 垂直绘制虚线
 * @param sx 起点 x
 * @param sy 起点 y
 * @param moveY 移动 y点
 * @param context 
 */
function drawRectDottedLineToVertical(sx: number, sy: number, moveY: number, context: CanvasRenderingContext2D) {
    if(sy > moveY) {
        if(baseSpeed > dottedLineBase) {
            context.moveTo(sx, sy);
            context.lineTo(sx, sy - (baseSpeed - dottedLineBase));
            context.stroke();
        }
    } else {
        if(baseSpeed > dottedLineBase) {
            context.moveTo(sx, sy);
            context.lineTo(sx, sy + (baseSpeed - dottedLineBase));
            context.stroke();
        }
    }

    context.setLineDash([ dottedLineBase ]);
    context.moveTo(sx, sy > moveY ? sy - baseSpeed : sy + baseSpeed);
    context.lineTo(sx, moveY);
    context.stroke();
}

/**
 * 水平
 * @param sx 起点 x
 * @param sy 起点 y
 * @param moveX 移动 y点
 * @param context 
 */
function drawRectDottedLineToHorizontal(sx: number, sy: number, moveX: number, context: CanvasRenderingContext2D) {
    if(sx < moveX) {
        if(baseSpeed > dottedLineBase) {
            context.moveTo(sx, sy);
            context.lineTo(sx + (baseSpeed - dottedLineBase), sy);
            context.stroke();
        }
    } else {
        if(baseSpeed > dottedLineBase) {
            context.moveTo(sx, sy);
            context.lineTo(sx - (baseSpeed - dottedLineBase), sy);
            context.stroke();
        }
    }   
    
    context.setLineDash([dottedLineBase, dottedLineBase]);
    context.moveTo(sx < moveX ? sx + baseSpeed : sx - baseSpeed, sy);
    context.lineTo(moveX, sy);
    context.stroke();
}

const resetSpeed = dottedLineBase * 2

let AnimationControl: number

/**
 * 运动的虚线的边框
 */
function drawRectDottedLineAnimation(context: CanvasRenderingContext2D){
    if(baseSpeed >= resetSpeed) {
        baseSpeed = 0
    }

    context.clearRect(0, 0, width, height)
    drawRect({
        sx: startX,
        sy: startY,
        ex: endX,
        ey: endY
    }, context, 'dottedLine')

    baseSpeed = Number((baseSpeed + speed).toFixed(2))
    AnimationControl = requestAnimationFrame(() => drawRectDottedLineAnimation(context))
}



// -------------------------------- 绘制圆形 -------------------------------------



let ellipseSite = 0; 

const 
    ellipseDash = 4,
    ellipseSpeed = 0.003,
    ellipseSpeedBase = ellipseDash / 10, 
    resetEllipseSpeed = 0.05;

/**
 * 绘制圆形
 */
function drawEllipse(coordinate: drawCoordinate, context: CanvasRenderingContext2D, type: lineType){
    reRender()
    if(type === 'fullLine') {
        drawEllipseFullLine(context, coordinate)
    } else if(type === 'dottedLine') {
        drawEllipseDottedLine(context, coordinate)
    } else {
        console.error(` is not draw type `)
    }
}

/**
 * 绘制动态虚线椭圆
 */
function drawEllipseDottedLine(context: CanvasRenderingContext2D, coordinate: drawCoordinate){

    const { x, y, radiusX, radiusY } = ellipseCircle(coordinate)

    context.setLineDash([ ellipseDash ])

    if(ellipseSite > ellipseSpeedBase) {
        context.beginPath();
        context.ellipse(x, y, radiusX, radiusY, 0, 0, ellipseSite - ellipseSpeedBase);
        context.stroke();
    }

    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, 0, 0 + ellipseSite, Math.PI);
    context.stroke();

    if(ellipseSite > ellipseSpeedBase) {
        context.beginPath();
        context.ellipse(x, y, radiusX, radiusY, 0, Math.PI, Math.PI + (ellipseSite - ellipseSpeedBase));
        context.stroke();
    }

    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, 0, Math.PI + ellipseSite, 2 * Math.PI);
    context.stroke();

}

/**
 * 开启动态虚线
 */
function drawEllipseDottedLineAnimation(context: CanvasRenderingContext2D){

    if(ellipseSite >= resetEllipseSpeed) {
        ellipseSite = 0
    }

    context.clearRect(0, 0, width, height)
    drawEllipse(
        {
            sx: startX,
            sy: startY,
            ex: endX,
            ey: endY
        },
        context, 
        'dottedLine'
    )

    ellipseSite = ellipseSite + ellipseSpeed

    AnimationControl = requestAnimationFrame(() => drawEllipseDottedLineAnimation(context))
}

/**
 * 绘制实线椭圆
 */
function drawEllipseFullLine(context: CanvasRenderingContext2D, coordinate: drawCoordinate){
    const { x, y, radiusX, radiusY } = ellipseCircle(coordinate)

    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
    context.stroke();
    context.closePath();
}

/**
 * 求椭圆圆心， 以及长半径和短半径的距离
 */
function ellipseCircle(coordinate: drawCoordinate){
    const { sx, sy, ex, ey } = coordinate

    let width = (ex - sx) / 2,
        longth = (ey - sy) / 2
    return { 
        x: width + sx, 
        y: longth + sy,
        radiusX: Math.abs(width),
        radiusY: Math.abs(longth)
    }
}