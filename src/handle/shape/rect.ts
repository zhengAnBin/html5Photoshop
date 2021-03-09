/**
 * 绘制矩形
 */

import { drawCoordinate, lineType } from './index'
import { useShape } from './shape'
import { reRender } from '../handle'
import { drawAcme } from './acme'

// 虚线的间隔
const dottedLineBase = 4

let 
    speedSite = 0,  // 线的叠加位置
    speed = 0.1  // 线的移动速度

// 重置线的参数
const resetSpeed = dottedLineBase * 2

/**
 * 绘制矩形
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
 * 矩形的颜色填充
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
 * 实线矩形
 */
const LINR_COLOR = '#1884EC',
    LINE_WIDTH = 1

function drawRectFullLine(context: CanvasRenderingContext2D, coordinate: drawCoordinate){
    const { sx, sy, ex, ey } = coordinate;
    context.beginPath();
    context.strokeStyle = LINR_COLOR;
    context.lineWidth = LINE_WIDTH;
    context.rect(sx, sy, ex - sx, ey - sy);
    context.stroke();
    context.closePath();
}

/**
 * 虚线矩形
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

/**
 * 垂直绘制虚线
 * @param sx 起点 x
 * @param sy 起点 y
 * @param moveY 移动 y点
 * @param context 
 */
 function drawRectDottedLineToVertical(sx: number, sy: number, moveY: number, context: CanvasRenderingContext2D) {
    
    if(sy > moveY) {
        if(speedSite > dottedLineBase) {
            context.moveTo(sx, sy);
            context.lineTo(sx, sy - (speedSite - dottedLineBase));
            context.stroke();
        }
    } else {
        if(speedSite > dottedLineBase) {
            context.moveTo(sx, sy);
            context.lineTo(sx, sy + (speedSite - dottedLineBase));
            context.stroke();
        }
    }

    context.setLineDash([ dottedLineBase ]);
    context.moveTo(sx, sy > moveY ? sy - speedSite : sy + speedSite);
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
        if(speedSite > dottedLineBase) {
            context.moveTo(sx, sy);
            context.lineTo(sx + (speedSite - dottedLineBase), sy);
            context.stroke();
        }
    } else {
        if(speedSite > dottedLineBase) {
            context.moveTo(sx, sy);
            context.lineTo(sx - (speedSite - dottedLineBase), sy);
            context.stroke();
        }
    }   
    
    context.setLineDash([dottedLineBase, dottedLineBase]);
    context.moveTo(sx < moveX ? sx + speedSite : sx - speedSite, sy);
    context.lineTo(moveX, sy);
    context.stroke();
}

/**
 * 动态虚线矩形
 */
export function drawRectDottedLineAnimation(){

    if(speedSite >= resetSpeed) {
        speedSite = 0
    }

    const { 
        context,
        startX,
        startY,
        endX,
        endY,
        clear,
        setAnimationControl
    } = useShape()

    clear()

    drawRect(
        {
            sx: startX,
            sy: startY,
            ex: endX,
            ey: endY
        }, 
        context, 
        'dottedLine'
    )

    speedSite = Number((speedSite + speed).toFixed(2))

    setAnimationControl(
        requestAnimationFrame(drawRectDottedLineAnimation)
    )
}
