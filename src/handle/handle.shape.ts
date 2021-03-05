/**
 * 矩形工具
 */
import { getPointOnCanvas } from './handle.common'
import { renderLayer, pushChildren } from './handle'

let d = 0
export class Shape {

    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    queue: {
        startX: number
        startY: number
        endX: number
        endY: number
    }[]
    
    startX?: number
    startY?: number
    endX?: number
    endY?: number

    is: boolean
    req: any

    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number){
        this.canvas = canvas
        this.context = context
        this.context.strokeStyle = 'red';
        this.queue = []

        this.is = false
    }

    reset(){
        this.queue.forEach(rect => this.brokenLineDraw(rect.startX, rect.startY, rect.endX, rect.endY))
    }

    draw1(startX: number, startY: number, x: number, y: number) {
        this.context.beginPath()
        this.context.strokeRect(startX, startY, x - startX, y - startY)
        this.context.closePath()
        this.endX = x
        this.endY = y
    }

    /**
     * 虚线绘制
     */
    brokenLineDraw(startX: number, startY: number, x: number, y: number) {
        this.context.beginPath()

        // left
        this.brokenLineForVertical(startX, startY, y)
        // bottom
        this.brokenLineForHorizontal(startX, y, x)
        // right
        this.brokenLineForVertical(x, startY, y)
        // top
        this.brokenLineForHorizontal(startX, startY, x)

        this.context.closePath()
        
        this.endX = x
        this.endY = y

    }

    /**
     * 垂直绘制虚线
     * @param startX 鼠标起点x
     * @param startY 鼠标起点y
     * @param moveY 绘制至
     */
    brokenLineForVertical(startX: number, startY: number, moveY: number){
        const context = this.context;
        if(startY > moveY) {
            if(d > 4) {
                context.moveTo(startX, startY);
                context.lineTo(startX, startY - (d - 4));
                context.stroke();
            }
        } else {
            if(d > 4) {
                context.moveTo(startX, startY);
                context.lineTo(startX, startY + (d - 4));
                context.stroke();
            }
        }
        
        context.setLineDash([4, 4]);
        context.moveTo(startX, startY > moveY ? startY - d : startY + d);
        context.lineTo(startX, moveY);
        context.stroke();
    }

    /**
     * 
     * 水平绘制虚线
     * @param startX 鼠标起点x
     * @param startY 鼠标起点y
     * @param moveX 绘制至
     */
    brokenLineForHorizontal(startX: number, startY: number, moveX: number){
        const context = this.context;
        if(startX < moveX) {
            if(d > 4) {
                context.moveTo(startX, startY);
                context.lineTo(startX + (d - 4), startY);
                context.stroke();
            }
        } else {
            if(d > 4) {
                context.moveTo(startX, startY);
                context.lineTo(startX - (d - 4), startY);
                context.stroke();
            }
        }   
        
        context.setLineDash([4, 4]);  // [实线长度, 间隙长度]
        context.moveTo(startX < moveX ? startX + d : startX - d, startY);
        context.lineTo(moveX, startY);
        context.stroke();
    }

    animation(){
        if(d >= 8) {
            d = 0
        }
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        renderLayer()
        this.brokenLineDraw(
            this.startX as number, 
            this.startY as number, 
            this.endX as number, 
            this.endY as number
        )
        d = Number((d + 0.1).toFixed(2))
        this.req = requestAnimationFrame(this.animation.bind(this))
    }

    init(){
        const canvas = this.canvas
        const context = this.context
        let timer: number | null
        const mousemove =  (event: MouseEvent) => {
         
            let { x, y } = getPointOnCanvas(this.canvas, event.pageX, event.pageY)
            context.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.reset()
            renderLayer()
            this.brokenLineDraw(this.startX as number, this.startY as number, x, y)
            clearTimeout(timer as number)
            timer = null
        }

        const mousedown = (event: MouseEvent) => {
            if(this.req) cancelAnimationFrame(this.req)
            
            const { x, y } = getPointOnCanvas(this.canvas, event.pageX, event.pageY)
            this.startX = x
            this.startY = y
            canvas.addEventListener('mousemove', mousemove)
            
        }
        
        const mouseup = () => {
            this.animation()
            
            canvas.removeEventListener('mousemove', mousemove)
            // pushChildren()
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

    }
    
}




/**
 * 在 Photoshop 中矩形有两种
 * 一种是矩形选框工具
 * 一种是矩形工具
 * 选框工具选中后，会创建一个虚线边框的矩形，且边框是动态的，按照一定规律运动
 * 选框工具选中后，会将前景色色板中的颜色进行填充，而且每个矩形是一个单独的图层
 * 按ctrl + t 可以等比例放大缩小，旋转
 * 
 */

// fullLine = 实线，  dottedLine = 虚线
type drawRectType = 'fullLine' | 'dottedLine'

/**
 * 
 * sx 起点x坐标
 * sy 起点y坐标
 * ex 终点x坐标
 * ey 终点y坐标
 */
type drawCoordinate = {
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
    type: drawRectType
){
    if(type === 'fullLine') {
        drawRectFullLine(context, coordinate)
    } else if(type === 'dottedLine') {
        drawRectDottedLine(context, coordinate)
    } else {
        console.error(` is not draw type `)
    }
}

let startX: number, startY: number, endX: number, endY: number

export function initRect(canvas: HTMLCanvasElement, type: drawRectType){

    
    const context = canvas.getContext('2d') as CanvasRenderingContext2D
    const width = canvas.width, height = canvas.height

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
        let { x, y } = getPointOnCanvas(canvas, event.pageX, event.pageY)
        drawRectDottedLineAnimation(context)
        canvas.removeEventListener('mousemove', mousemove)
        endX = x
        endY = y
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
    // context.strokeStyle = ''
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
    if(sx > moveY) {
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
    
    context.setLineDash([dottedLineBase, dottedLineBase]);
    context.moveTo(sx, sy > moveY ? sy - baseSpeed : sy + baseSpeed);
    context.lineTo(sx, moveY);
    context.stroke();
}

/**
 * 
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

    // context.clearRect(0, 0, )
    // drawRectDottedLine(context, {

    // })

    baseSpeed = Number((baseSpeed + speed).toFixed(2))
    AnimationControl = requestAnimationFrame(() => drawRectDottedLineAnimation(context))
}