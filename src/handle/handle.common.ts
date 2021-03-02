/**
 * 公共方法
 */


// 鼠标按下， 移动， 松开
// 按住Ctrl+Alt， 会以鼠标按下为中心，绘制图形

export function GraphicsBehavior(
    canvas: HTMLCanvasElement, 
    mousemove: (event: MouseEvent) => any,
    getStartPoint: (x: number, y: number) => any
) {
    let x, y
    const mousedown = (event: MouseEvent) => {
        x = event.pageX
        y = event.pageY
        canvas.addEventListener('mousemove', mousemove)
        console.log(1)
        getStartPoint(x, y)
    }
    
    const mouseup = () => {
        canvas.removeEventListener('mousemove', mousemove)
    }
    
    canvas.addEventListener('mousedown', mousedown)
    canvas.addEventListener('mouseup', mouseup)

    return {
        x, y
    }
}

export function getPointOnCanvas(canvas: HTMLCanvasElement,x: number, y: number) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: x - rect.left,
        y: y - rect.top
    }
}