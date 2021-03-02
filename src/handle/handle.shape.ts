/**
 * 矩形工具
 */
import { getPointOnCanvas } from './handle.common'

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

    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D){
        this.canvas = canvas
        this.context = context
        this.context.strokeStyle = 'red';
        this.queue = []
    }

    reset(){
        this.queue.forEach(rect => this.draw(rect.startX, rect.startY, rect.endX, rect.endY))
    }

    draw(startX: number, startY: number, x: number, y: number) {
        this.context.beginPath()
        this.context.strokeRect(startX, startY, x - startX, y - startY)
        this.context.closePath()
        this.endX = x
        this.endY = y
    }

    init(){
        const canvas = this.canvas
        const context = this.context
        const mousemove =  (event: MouseEvent) => {
            let { x, y } = getPointOnCanvas(this.canvas, event.pageX, event.pageY)
            context.clearRect(0, 0, this.canvas.width, this.canvas.height)
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, canvas.width, canvas.height)
            this.reset()
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
