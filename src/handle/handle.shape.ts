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
        // console.log(2)
    }

    /**
     * 垂直绘制虚线
     * @param startX 鼠标起点x
     * @param startY 鼠标起点y
     * @param moveY 绘制至
     */
    brokenLineForVertical(startX: number, startY: number, moveY: number){
        startY = startY + d

        let point , moveToY

        if(startY > moveY) {  // - int 起点大于终点
            point = startY
            // 结束条件为起点小于终点时，结束循环
            while(point - moveY > 0) {
                moveToY = point - 4
                this.context.moveTo(startX, moveToY < moveY ? moveY : moveToY)
                this.context.lineTo(startX, point)
                this.context.stroke();

                // 起点不断减小
                point = point - 8
            }
        } else {  // + int  起点小于终点
            point = startY
            // 结束条件为起点大于终点
            while(point - moveY < 0) {
                moveToY = point + 4
                this.context.moveTo(startX, point)
                this.context.lineTo(startX, moveToY > moveY ? moveY : moveToY)
                this.context.stroke();

                // 起点不断减小
                point = point + 8
            }
        }

        
        
        // let test = startY
        // let lineTo
        // for (let index = 0; index < y; index ++) {
        //     lineTo = startY + 4 * Math.sign(y)
        //     if(startY < Math.abs(y)) {
        //         this.context.moveTo(startX, startY)
        //         this.context.lineTo(startX, lineTo > y ? startY * Math.sign(y) : lineTo)
        //         this.context.stroke();
        //         startY += 8
        //     }
        // }
    }

    /**
     * 
     * 水平绘制虚线
     * @param startX 鼠标起点x
     * @param startY 鼠标起点y
     * @param moveX 绘制至
     */
    brokenLineForHorizontal(startX: number, startY: number, moveX: number){
        startX = startX + d
        let point, moveToX

        if(startX > moveX) { // 起点大于终点 就是往左走
            point = startX

            while(point - moveX > 0) {
                moveToX = point - 4
                this.context.moveTo(point, startY)
                this.context.lineTo(moveToX > moveX ? moveToX : moveX, startY)
                this.context.stroke();
                point = point - 8
            }

        } else {
            point = startX

            while(point - moveX < 0) {
                moveToX = point + 4
                this.context.moveTo(moveToX < moveX ? moveToX : moveX, startY)
                this.context.lineTo(point, startY)
                this.context.stroke();
                // 起点不断减小
                point = point + 8

            }
        }
        // let lineTo
        // for (let index = 0; index < x; index ++) {
        //     lineTo = startX + 4 * Math.sign(x)
        //     if(startX < Math.abs(x)) {
        //         this.context.moveTo(startX, startY)
        //         this.context.lineTo(lineTo < x ? lineTo : startX * Math.sign(x), startY)
        //         this.context.stroke();
        //         startX += 8
        //     }
        // }
    }

    animation(){
        if(d >= 6) {
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
        d = d + 0.1
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
