/**
 * author: wcc
 * create_time: 2022/4/17
 */

import { WMatrix } from './tool'


class Base {
    _color: string = '#fff'
    _width: number = 50
    _height: number = 50
    ma: WMatrix = new WMatrix()
    centerPoint: {x: number, y: number} = {x: 0, y: 0}
    globalPoint: {x: number, y: number} = {x: 0, y: 0}
    angle: number = 0

    constructor(obj: any) {
        this._color = obj.color || '#ffffff';
        this._width = obj.width;
        this._height = obj.height
        this.centerPoint = {
            x: this._width / 2,
            y: this._height / 2
        };
        this.globalPoint = {
            x: 0,
            y: 0
        };
    }

    get width() {
        return this._width
    }

    get height() {
        return this._height
    }

    draw(ctx: CanvasRenderingContext2D) {}

    reset() {
        this.ma.reset();
        this.ma.translate(this.globalPoint.x, this.globalPoint.y)
    }

    isInner(pt: {x: number, y: number}) {
        // mouse pt click in icon
        let xLeft = this.globalPoint.x + this.centerPoint.x - this._width / 2,
            xRight = this.globalPoint.x + this.centerPoint.x + this._width / 2,
            yBottom = this.globalPoint.y + this.centerPoint.y- this._height / 2,
            yTop = this.globalPoint.y + this.centerPoint.y+ this._height / 2; 
        return (pt.x > xLeft && pt.x < xRight && pt.y < yTop && pt.y > yBottom)
    }

    translate(x: number, y: number) {
        this.globalPoint.x += x;
        this.globalPoint.y += y;
        return this.ma.translate(x, y)
    }

    rotate(angle: number) {
        return this.ma.rotate(angle)
    }

    rotateAt(angle: number, pt: {x: number, y: number}) {
        this.ma.translate(pt.x, pt.y);
        this.ma.rotate(angle);
        this.ma.translate(-pt.x, -pt.y);
    }

    rotateCenter(angle: number) {
        this.rotateAt(angle, this.centerPoint)
    }
}

class Page {
    _ctx!: CanvasRenderingContext2D
    _canvasW: number = 0
    _canvasH: number = 0

    constructor(obj: any) {
        this._ctx = obj.ctx;
        this._canvasW = obj.canvasWidth;
        this._canvasH = obj.canvasHeight;
    }

    get ctx() {
        return this._ctx
    }

    clean() {
        this._ctx.clearRect(0, 0, this._canvasW, this._canvasH);
    }
}

class DrawIcon extends Base{
    // shape data
    _padding!: number
    _startX!: number
    _startY!: number
    _boxWidth!: number
    _triangleX!: number
    _triangleH!: number


    // animation
    animationTime: number = 0
    animationKey: number = 0
    animationDirctect: number = 1
    animationProgress: number = 0
    animationStep: number = 0
    // fill animation
    useFill: boolean = true
    fillDirctect: number = 1
    fillProgress: number = 0  // 0-1
    fillStep: number = 0.01
    // rotate animation
    useRotate: boolean = true
    rotateDirctect: number = 1
    rotateProgress: number = 0 // 0 - -90
    rotateStep: number = 0.01

    // force
    forceMaxPower: boolean = false
    forceBestAngle: boolean = false

    constructor(obj: any) {
        super(obj)
        this.animationTime = obj. duration;
        this.init();
    }

    init() {
        // set size 
        this._padding = 4 / 24 * this.width;
        this._startX = 4 / 24 * this.width;
        this._startY = (24 - 6) / 2 / 24 * this.height;
        this._boxWidth = 6 / 24 * this.width;
        this._triangleX = 20 / 24 * this.width;
        this._triangleH = 16 / 24 * this.height;

        // set animation step
        let t = this.animationTime;
        this.animationStep = 1 / 60 / t;
        this.fillStep = 1 / 60 / t * 3; // 填充三倍速
        this.rotateStep = -90 / 60 / t;
    }

    hackData(obj: any) {
        let keys = Object.keys(obj);
        keys.includes('power') && (this.forceMaxPower = obj.power);
        keys.includes('angle') && (this.forceBestAngle = obj.angle);
    }

    getPower() {
        return {
            power: this.fillProgress,
            angle: Math.abs(this.rotateProgress)
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.drawIcon(ctx);
        this.drawRect(ctx);
    }

    drawAnimation(ctx: CanvasRenderingContext2D, cleanFunc: Function, otherDraw: Array<Function>) {
        cleanFunc && cleanFunc()
        this.draw(ctx);
        for(let f of otherDraw) {
            f && f()
        }
        if(this.animationDirctect) {
            this.animationProgress += this.animationStep
            this.animationProgress = this.animationProgress > 1 ? 1 : this.animationProgress
        } else {
            this.animationProgress -= this.animationStep
            this.animationProgress = this.animationProgress < 0 ? 0 : this.animationProgress
        }
        if(this.useFill) {
            if(this.forceMaxPower) {
                this.fillProgress = 1
            } else {
                if(this.fillDirctect) {
                    this.fillProgress += this.fillStep;
                    this.fillProgress = this.fillProgress > 1 ? 1 : this.fillProgress
                } else {
                    this.fillProgress -= this.fillStep;
                    this.fillProgress = this.fillProgress < 0 ? 0 : this.fillProgress
                }
            }
        }
        if(this.useRotate) {
            if(this.forceBestAngle) {
                this.rotateProgress = -45
            } else {
                if(this.rotateDirctect) {
                    this.rotateProgress += this.rotateStep;
                    this.rotateProgress = this.rotateProgress < -90 ? -90 : this.rotateProgress
                } else {
                    this.rotateProgress -= this.rotateStep;
                    this.rotateProgress = this.rotateProgress > 0 ? 0 : this.rotateProgress
                }
            }
        }
        if(this.animationProgress == 1 || this.animationProgress == 0) {
            this.animationDirctect = !this.animationDirctect ? 1 : 0
            this.rotateDirctect = !this.rotateDirctect ? 1 : 0
        }
        if(this.fillProgress == 1 || this.fillProgress == 0) {
            this.fillDirctect = !this.fillDirctect ? 1 : 0
        }
        this.animationKey = requestAnimationFrame(this.drawAnimation.bind(this, ctx, cleanFunc, otherDraw));
    }

    drawIcon(ctx: CanvasRenderingContext2D) {
        let points = [
            [this._padding + this._startX, this._startY],
            [this._padding + this._startX + this._boxWidth, this._startY],
            [this._triangleX, this._padding],
            [this._triangleX, this._padding + this._triangleH],
            [this._padding + this._startX + this._boxWidth, this._startY + this._boxWidth],
            [this._padding + this._startX, this._startY + this._boxWidth],
        ]
        let cloneMa = this.ma.clone();
        cloneMa.translate(this.centerPoint.x, this.centerPoint.y);
        cloneMa.rotate(this.rotateProgress);
        cloneMa.translate(-this.centerPoint.x, -this.centerPoint.y);
        points = points.map(item => cloneMa.transformXY(item[0], item[1]))
        ctx.beginPath();
        for(let i = 0; i < points.length; i++) {
            if(i == 0) {
                ctx.moveTo(points[i][0], points[i][1])
            } else {
                ctx.lineTo(points[i][0], points[i][1])
            }
        }
        ctx.closePath()
        ctx.strokeStyle = this._color
        ctx.stroke();
        ctx.save();
        ctx.clip();
    }

    drawRect(ctx: CanvasRenderingContext2D) {
        let expandLength = this._padding + this._startX + (this._triangleX - this._padding - this._startX) * this.fillProgress
        let points = [
            [this._padding + this._startX, 0],
            [expandLength, 0],
            [expandLength, this.height],
            [this._padding + this._startX, this.height],
        ]
        let cloneMa = this.ma.clone();
        cloneMa.translate(this.centerPoint.x, this.centerPoint.y);
        cloneMa.rotate(this.rotateProgress);
        cloneMa.translate(-this.centerPoint.x, -this.centerPoint.y);
        points = points.map(item => cloneMa.transformXY(item[0], item[1]))
        ctx.beginPath();
        for(let i = 0; i < points.length; i++) {
            if(i == 0) {
                ctx.moveTo(points[i][0], points[i][1])
            } else {
                ctx.lineTo(points[i][0], points[i][1])
            }
        }
        ctx.closePath()
        ctx.strokeStyle = this._color
        ctx.fillStyle = this._color
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }

    startAnimation(ctx: CanvasRenderingContext2D, cleanFunc: Function, otherDraw: Array<Function>) {
        this.animationKey = requestAnimationFrame(this.drawAnimation.bind(this, ctx, cleanFunc, otherDraw));
    }

    stop() {
        cancelAnimationFrame(this.animationKey);
    }

    cleanAnimation() {
        this.animationKey = 0;
        this.animationDirctect = 1;
        this.fillDirctect = 1;
        this.rotateDirctect = 1;
        this.fillProgress = 0;
        this.rotateProgress = 0;
        this.animationProgress = 0;
    }

    clean() {
        this.stop();
        this.cleanAnimation();
        this.reset();
    }
}

class DrawBar extends Base{
    _radius: number = 0

    constructor(obj: any) {
        super(obj)
        this.init(obj.barPosition);
    }

    init(position: Array<number>) {
        this._radius = this.height / 2;
        this.translate(position[0], position[1] / 2 - this.height / 2);
    }

    draw(ctx: CanvasRenderingContext2D) {
        let temp = this.ma.transformXY(0, 0);
        let x = temp[0],
            y = temp[1],
            w = this.width,
            h = this.height,
            r = this._radius;
        if(h < 2 * r) {r = h / 2}
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + 1, r)
        ctx.arcTo(x + w, y + h, x, y + 1, r)
        ctx.arcTo(x, y + h, x, y, r)
        ctx.arcTo(x, y, x + 1, y, r)
        ctx.closePath();
        ctx.fillStyle = this._color;
        ctx.fill();
    }
}

class DrawBall extends Base{
    _zero: number = 1e-15
    _size: number = 10
    ma: WMatrix = new WMatrix()
    barWidth: number = 0
    power: number = 0
    angle: number = 0
    resultS: number = 0
    playDone: Function | null = null
    // animation
    key: number = 0
    time: number = 0
    progress: number = 0
    step: number = 0

    constructor(obj: any) {
        super(obj);
        this.time = obj.ballDuration
        this.init(obj)
    }

    init(obj: any) {
        this.barWidth = obj.barWidth;
        this.translate(obj.barPosition[0], obj.barPosition[1]);
        this.step = 1 / 60 / this.time;
    }

    setPower(obj: any) {
        this.power = obj.power;
        this.angle = obj.angle;
        let angle =  this.angle * Math.PI / 180;
        let s = 0,
            cos = Math.cos(angle),
            sin = Math.sin(angle);
        s = 2 * this.barWidth * this.power * cos * sin
        this.resultS = s;
    }

    setPlayDone(f: Function) {
        this.playDone = f;
    }

    getResult() {
        // 获取最终结果
        return this.resultS / this.barWidth
    }

    getPoints(x: number) {
        let angle =  this.angle * Math.PI / 180;
        let tan = Math.tan(angle);
        tan = 1 - tan <= this._zero ? 1 : tan
        let s = this.resultS,
            x_middle = s / 2,
            a =  x_middle == 0 ? 0 : -tan /  x_middle,
            y = a * x * (x - s) * -1;
        return isNaN(y) ? 0 : y
    }

    draw(ctx: CanvasRenderingContext2D) {
        let r = this._size / 2,
            x = 0 + this.progress * this.resultS,
            y = this.getPoints(x);
        let points = []
            points.push([
                x,
                this.getPoints(x)
            ])
        points = points.map(item => this.ma.transformXY(item[0], item[1]))
        ctx.beginPath();
        for(let item of points) {
            let x = item[0],
                y = item[1];
            ctx.moveTo(x, y);
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.fillStyle = this._color;
            ctx.fill();
        }
        ctx.closePath();
        this.drawText(ctx);
    }

    drawText(ctx: CanvasRenderingContext2D) {
        let text = '' +Math.floor(this.progress * this.resultS / this.barWidth * 100);
        ctx.font = "14px"
        ctx.fillStyle = "#ffffff";
        let textW = ctx.measureText(text);
        let cloneMa = this.ma.clone();
        cloneMa.translate(this.barWidth, 30);
        let temp = cloneMa.transformXY(0, 0);
        ctx.fillText(text, temp[0] - textW.width, temp[1])
    }

    drawAnimation(ctx: CanvasRenderingContext2D, cleanFunc: Function, otherDraw: Array<Function>) {
        cleanFunc && cleanFunc()
        for(let f of otherDraw) {
            f && f()
        }
        this.draw(ctx);
        if(this.progress < 1) {
            this.progress += this.step;
            this.progress = this.progress > 1 ? 1 : this.progress;
            this.key = requestAnimationFrame(this.drawAnimation.bind(this, ctx, cleanFunc, otherDraw));
        } else {
            this.stop();
            this.key = 0;
            this.progress = 0;
        }
    }

    startAnimation(ctx: CanvasRenderingContext2D, cleanFunc: Function, otherDraw: Array<Function>) {
        this.key = requestAnimationFrame(this.drawAnimation.bind(this, ctx, cleanFunc, otherDraw));
    }

    stop() {
        cancelAnimationFrame(this.key);
        this.playDone && this.playDone();
    }

    cleanAnimation() {
        this.key = 0;
        this.progress = 0;
    }

    clean() {
        this.stop();
        this.cleanAnimation();
        this.reset();
    }
}

/**
obj ={
    ctx:
    canvasWidth:
    canvasHeight:
    iconWidth:
    iconHeight:
    barWidth:
    barHeight:
    ballWidth:
    ballHeight:
    barPosition: []
    duration: // 点击动画持续时长
    ballDuration: // 球运动时长
}
*/
export class Draw {
    page: Page
    icon!: DrawIcon
    bar!: DrawBar
    ball!: DrawBall
    clickInside: boolean = false

    constructor(obj: any) {
        this.page = new Page(obj)
        let iconObj = {
            width: obj.iconWidth || obj.canvasWidth / 8,
            height: obj.iconHeight || obj.canvasWidth / 8,
            duration: obj.duration || 3,
        }
        let barObj = {
            width: obj.barWidth || obj.canvasWidth / 8 * 6,
            height: obj.barHeight || obj.barWidth / 20,
            barPosition: [obj.iconWidth, obj.iconHeight]
        }
        let ballObj = {
            width: obj.ballWidth || obj.barWidth / 15,
            height: obj.ballHeight || obj.barWidth / 20,
            barWidth: barObj.width,
            ballDuration: obj.ballDuration || 1,
            barPosition: [obj.iconWidth, obj.iconHeight / 2],
            color: '#6cf'
        }
        this.icon = new DrawIcon(iconObj)
        this.bar = new DrawBar(barObj)
        this.ball = new DrawBall(ballObj)
        this.translate(0, obj.canvasHeight / 2)
    }

    draw() {
        this.clean();
        let ctx = this.page.ctx;
        this.icon.draw(ctx);
        this.bar.draw(ctx);
    }

    clean() {
        this.page.clean();
    }

    hackData(type:string, data: any) {
        switch(type) {
            case 'icon': {
                this.icon.hackData(data)
            }
        }
    }

    translate(x: number, y: number) {
        this.icon.translate(x, y)
        this.bar.translate(x, y)
        this.ball.translate(x, y)
    }

    iconMouseDown(pt: {x: number, y: number}) {
        // 鼠标按住，播放蓄力及旋转动画
        this.clickInside = this.icon.isInner(pt);
        if(this.clickInside) {
            let ctx = this.page.ctx;
            this.icon.startAnimation(ctx, this.clean.bind(this), [
                this.bar.draw.bind(this.bar, ctx)
            ])
        }
    }


    playDone() {
        // 动画完成
    }

    iconMouseUp() {
        if(!this.clickInside)
            return
        this.clickInside = false
        // 鼠标抬起，定格蓄力及角度
        this.icon.stop();
        // 开始小球动画
        let power = this.icon.getPower();
        this.ball.setPower(power);
        this.ball.setPlayDone(this.playDone.bind(this));
        let ctx = this.page.ctx;
        this.ball.startAnimation(ctx, this.clean.bind(this), [
            this.icon.clean.bind(this.icon),
            this.icon.draw.bind(this.icon, ctx),
            this.bar.draw.bind(this.bar, ctx)
        ])
    }

    finalClean() {
        this.clean();
        this.icon.clean();
        this.ball.clean();
        let ctx = this.page.ctx;
        this.icon.draw(ctx);
        this.bar.draw(ctx);
    }
}

