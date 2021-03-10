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

/**
 * 圆角矩形
 */
export function drawRoundRect(
    context: CanvasRenderingContext2D, 
    coordinate: drawCoordinate,
    r: number
){  
    let { sx, sy, ex, ey } = coordinate

    if(ex < sx) {
        [ ex, sx ] = [ sx, ex ];
        [ ey, sy ] = [ sy, ey ];
    }

    const w = ex - sx
    const h = ey - sy

    r = r * Math.sign(ex - sx)

    context.clearRect(0, 0, 500, 500)
    context.beginPath()
    context.strokeStyle = '#1884EC'

    // 左上角
    // if(r > 0) {
    //     context.arc(sx + r, sy + r, r, Math.PI, Math.PI * 1.5)
    // } else if(r < 0) {
    //     context.arc(sx - nr, sy - nr, nr, 0, Math.PI * 0.5)
    // }
    context.arc(sx + r, sy + r, r, Math.PI, Math.PI * 1.5)

    // border-top
    context.moveTo(sx + r, sy)
    context.lineTo(sx + w - r, sy)

    // 右上角
    // if(r > 0) {
    //     context.arc(sx + w - r, sy + r, r, Math.PI * 1.5, Math.PI * 2)
    // } else if(r < 0) {
    //     context.arc(sx + w + nr, sy - nr, nr, Math.PI * 0.5, Math.PI)
    // }
    context.arc(sx + w - r, sy + r, r, Math.PI * 1.5, Math.PI * 2)
    // border-right
    context.moveTo(sx + w, sy + r)
    context.lineTo(sx + w, sy + h - r)

    // 右下角
    // if(r > 0) {
    //     context.arc(sx + w - r, sy + h - r, r, 0, Math.PI * 0.5)
    // } else if(r < 0) {
    //     context.arc(sx + w + nr, sy + h + nr, nr, Math.PI, Math.PI * 1.5)
    // }
    context.arc(sx + w - r, sy + h - r, r, 0, Math.PI * 0.5)
    // border-bottom
    context.moveTo(sx + w - r, sy + h)
    context.lineTo(sx + r, sy + h)
    
    // 左下角
    // if(r > 0) {
    //     context.arc(sx + r, sy + h - r, r, Math.PI * 0.5, Math.PI)
    // } else if(r < 0) {
    //     context.arc(sx - nr, sy + h + nr, nr, Math.PI * 1.5, Math.PI * 2)
    // }
    context.arc(sx + r, sy + h - r, r, Math.PI * 0.5, Math.PI)
    // border-left
    context.moveTo(sx, sy + h - r)
    context.lineTo(sx, sy + r)

    context.stroke()
    
    context.closePath()
}

/**
 * 此绘制方法适合仅局限与填充颜色
 */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string) {
    // 开始绘制
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(x + r, y + r, Math.abs(r), Math.PI, Math.PI * 1.5)

    // border-top
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.lineTo(x + w, y + r)
    // 右上角
    ctx.arc(x + w - r, y + r, Math.abs(r), Math.PI * 1.5, Math.PI * 2)

    // border-right
    ctx.lineTo(x + w, y + h - r)
    ctx.lineTo(x + w - r, y + h)
    // 右下角
    ctx.arc(x + w - r, y + h - r, Math.abs(r), 0, Math.PI * 0.5)

    // border-bottom
    ctx.lineTo(x + r, y + h)
    ctx.lineTo(x, y + h - r)
    // 左下角
    ctx.arc(x + r, y + h - r, Math.abs(r), Math.PI * 0.5, Math.PI)

    // border-left
    ctx.lineTo(x, y + r)
    ctx.lineTo(x + r, y)

    ctx.fill()
    ctx.closePath()
}

export function fillRoundRect(
    context: CanvasRenderingContext2D, 
    coordinate: drawCoordinate,
    r: number,
    color: string
){
    let { sx, sy, ex, ey } = coordinate

    if(ex < sx) {
       [ ex, sx ] = [ sx, ex ];
       [ ey, sy ] = [ sy, ey ];
    }

    const w = ex - sx
    const h = ey - sy

    roundRect(context, sx, sy, w, h, r, color)
}