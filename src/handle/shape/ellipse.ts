/**
 * 绘制椭圆形
 */

import { drawCoordinate, lineType } from './index'
import { useShape } from './shape'
import { reRender } from '../handle'

let ellipseSite = 0; 

const 
    ellipseDash = 4,
    ellipseSpeed = 0.003,
    ellipseSpeedBase = ellipseDash / 10, 
    resetEllipseSpeed = 0.05;

/**
 * 绘制圆形
 */
export function drawEllipse(coordinate: drawCoordinate, context: CanvasRenderingContext2D, type: lineType){
    reRender()
    if(type === 'fullLine') {
        drawEllipseFullLine(context, coordinate)
    } else if(type === 'dottedLine') {
        drawEllipseDottedLine(context, coordinate)
    } else {
        console.error(` is not draw type `)
    }
}

/**
 * 实线椭圆
 */
 function drawEllipseFullLine(context: CanvasRenderingContext2D, coordinate: drawCoordinate){
    const { x, y, radiusX, radiusY } = ellipseCircle(coordinate)

    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
    context.stroke();
    context.closePath();
}

/**
 * 椭圆形填充颜色
 */
 export function fillEllipse(
    context: CanvasRenderingContext2D, 
    coordinate: drawCoordinate, 
    color: string
){
    const { x, y, radiusX, radiusY } = ellipseCircle(coordinate)
    context.beginPath()
    context.fillStyle = color
    context.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI)
    context.fill()
    context.closePath()
}

/**
 * 虚线椭圆
 */
function drawEllipseDottedLine(context: CanvasRenderingContext2D, coordinate: drawCoordinate){

    const { x, y, radiusX, radiusY } = ellipseCircle(coordinate)

    context.setLineDash([ ellipseDash ])

    if(ellipseSite > ellipseSpeedBase) {
        context.beginPath();
        context.ellipse(x, y, radiusX, radiusY, 0, 0, ellipseSite - ellipseSpeedBase);
        context.stroke();
    }

    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, 0, 0 + ellipseSite, Math.PI);
    context.stroke();

    if(ellipseSite > ellipseSpeedBase) {
        context.beginPath();
        context.ellipse(x, y, radiusX, radiusY, 0, Math.PI, Math.PI + (ellipseSite - ellipseSpeedBase));
        context.stroke();
    }

    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, 0, Math.PI + ellipseSite, 2 * Math.PI);
    context.stroke();

}

/**
 * 开启动态虚线
 */
export function drawEllipseDottedLineAnimation(){

    if(ellipseSite >= resetEllipseSpeed) {
        ellipseSite = 0
    }

    const {
        context,
        clear,
        startX,
        startY,
        endX,
        endY,
        setAnimationControl
    } = useShape()

    clear()

    drawEllipse(
        {
            sx: startX,
            sy: startY,
            ex: endX,
            ey: endY
        },
        context, 
        'dottedLine'
    )

    ellipseSite = ellipseSite + ellipseSpeed

    setAnimationControl(
        requestAnimationFrame(drawEllipseDottedLineAnimation)
    )
}

/**
 * 求椭圆圆心， 以及长半径和短半径的距离
 */
 function ellipseCircle(coordinate: drawCoordinate){

    const { sx, sy, ex, ey } = coordinate

    let width = (ex - sx) / 2,
        longth = (ey - sy) / 2

    return { 
        x: width + sx, 
        y: longth + sy,
        radiusX: Math.abs(width),
        radiusY: Math.abs(longth)
    }
}
