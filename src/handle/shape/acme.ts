/**
 * 绘制顶点
 */

const LINR_COLOR = '#1884EC'
const SIZE = 8

type came = {
    x: number,
    y: number
}[]

export function drawAcme(context: CanvasRenderingContext2D, came: came){

    came.forEach(point => {
        context.beginPath()
        context.fillStyle = LINR_COLOR;
        context.fillRect(
            point.x - (SIZE / 2),
            point.y - (SIZE / 2),
            SIZE,
            SIZE
        )
        context.fill()
        context.closePath()
    })
}