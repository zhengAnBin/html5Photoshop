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
 * 选框工具选中后，会创建一个虚线边框的矩形，且边框是动态的，按照一定规律运动
 * 选框工具选中后，会将前景色色板中的颜色进行填充，而且每个矩形是一个单独的图层
 * 按ctrl + t 可以等比例放大缩小，旋转
 * 
 */

/**
 * fullLine = 实线
 * dottedLine = 虚线
 */
type shapeType = 'fullLine' | 'dottedLine'

/**
 * 
 * sx 起点x坐标
 * sy 起点y坐标
 * ex 终点x坐标
 * ey 终点y坐标
 */
export type drawCoordinate = {
    sx: number
    sy: number
    ex: number
    ey: number
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
    type: shapeType
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

let 
    layerIndex: number,
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number,
    width: number,
    height: number

export function initRect(canvas: HTMLCanvasElement, index: number, type: shapeType) {

    const context = canvas.getContext('2d') as CanvasRenderingContext2D

    width = canvas.width
    height = canvas.height
    layerIndex = index

    let timer: number | null

    // 鼠标移动
    const mousemove =  (event: MouseEvent) => {
        let { x, y } = getPointOnCanvas(canvas, event.pageX, event.pageY)
        if(!timer) {
            timer = setTimeout(() => {
                context.clearRect(0, 0, width, height)
                drawRect({
                    sx: startX,
                    sy: startY,
                    ex: x,
                    ey: y
                }, context, type)
                clearTimeout(timer as number)
                timer = null
            }, 20)
        }
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
    const mouseup = (event: MouseEvent) => {
        const { x, y } = getPointOnCanvas(canvas, event.pageX, event.pageY)

        // TODO: 开启虚线动画
        drawRectDottedLineAnimation(context)
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

        const nKeyCode = event.keyCode || event.which || event.charCode

        const isCtrl = event.ctrlKey || event.metaKey;
        const isAlt = event.altKey

        if(nKeyCode === 46 && isCtrl) {
            // Ctrl + delete 填充背景色
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

export function fillRect(context: CanvasRenderingContext2D, coordinate: drawCoordinate, color: string) {
    const { sx, sy, ex, ey } = coordinate
    context.beginPath()
    context.fillStyle = color
    context.fillRect(sx, sy, (ex - sx), (ey - sy))
    // context.fill()
    context.closePath()
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

    context.setLineDash([ dottedLineBase, dottedLineBase ]);
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

/**
 * 绘制圆形
 */

function drawEllipse(context: CanvasRenderingContext2D, type: shapeType){
    
}

/**
 * 初始圆形
 */
function initEllipse(canvas: HTMLCanvasElement){

}