/**
 * 矩形工具
 */
import { getPointOnCanvas } from './handle.common'
import { renderLayer, pushChildren } from './handle'

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

    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, index: number){
        this.canvas = canvas
        this.context = context
        this.context.strokeStyle = 'red';
        this.queue = []
    }

    reset(){
        this.queue.forEach(rect => this.draw(rect.startX, rect.startY, rect.endX, rect.endY))
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
    draw(startX: number, startY: number, x: number, y: number) {
        this.context.beginPath()
        // 
        // this.context.moveTo(startX, startY)
        // this.context.lineTo(startX, y)
        this.brokenLine(startX, startY, y)
        // this.context.lineTo(x, y)
        this.context.stroke();
        
        // this.context.moveTo(startX, startY)
        // this.context.lineTo(x, startY)
        // this.context.lineTo(x, y)
        // this.context.stroke();

        this.context.closePath()

        this.endX = x
        this.endY = y
    }

    /**
     * 虚线绘制法
     */
    brokenLine(startX: number, startY: number, y: number){
        
        for (let index = 0; index < y; index ++) {
            if(startY < y) {
                this.context.moveTo(startX, startY)
                this.context.lineTo(startX, startY + 4)
                this.context.stroke();
                startY += 8
            }
        }
    }

    init(){
        const canvas = this.canvas
        const context = this.context
        const mousemove =  (event: MouseEvent) => {
            let { x, y } = getPointOnCanvas(this.canvas, event.pageX, event.pageY)
            context.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.reset()
            renderLayer()
            this.draw(this.startX as number, this.startY as number, x, y)
        }

        const mousedown = (event: MouseEvent) => {
            const { x, y } = getPointOnCanvas(this.canvas, event.pageX, event.pageY)
            this.startX = x
            this.startY = y
            canvas.addEventListener('mousemove', mousemove)
        }
        
        const mouseup = () => {
            canvas.removeEventListener('mousemove', mousemove)
            // pushChildren()
            this.queue.push({
                startX: this.startX as number,
                startY: this.startY as number,
                endX: this.endX as number,
                endY: this.endY as number
            })
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
