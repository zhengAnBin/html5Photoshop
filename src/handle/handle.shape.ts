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
