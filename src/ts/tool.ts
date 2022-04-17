/**
 * author: wcc
 * create_time: 2022/4/17
 */
const ZeroDist = 1e-10
export class WMatrix {
    _a!: number
    _b!: number
    _c!: number
    _d!: number
    _e!: number
    _f!: number

    constructor(...args: Array<number>) {
        let count = args.length;
        if (count === 6) {
            this.set(args[0], args[1], args[2], args[3], args[4], args[5]);
        } else {
            this.reset();
        }
    }

    clone() {
        return new WMatrix(this._a, this._b, this._c, this._d, this._e, this._f);
    }

    reset() {
        this._a = this._d = 1;
        this._b = this._c = this._e = this._f = 0;
    }

    set(a: number, b: number, c: number, d: number, e: number, f: number) {
        this._a = a;
        this._b = b;
        this._c = c;
        this._d = d;
        this._e = e;
        this._f = f;
    }

    translate(x: number, y: number) {
        this._e = this._a * x + this._c * y + this._e;
        this._f = this._b * x + this._d * y + this._f;
        return this
    }

    scale(x: number, y: number) {
        this._a *= x;
        this._b *= x;
        this._c *= y;
        this._d *= y;
        return this
    }

    rotate(angle: number) {
        angle *=  Math.PI / 180;
        let cos = Math.cos(angle),
            sin = Math.sin(angle),
            a = this._a,
            b = this._b,
            c = this._c,
            d = this._d;

        this._a = a * cos + c * sin;
        this._b = b * cos + d * sin;
        this._c = a * -sin + c * cos;
        this._d = b * -sin + d * cos;

        this._a = Math.abs(this._a) < ZeroDist ? 0 : this._a;
        this._b = Math.abs(this._b) < ZeroDist ? 0 : this._b;
        this._c = Math.abs(this._c) < ZeroDist ? 0 : this._c;
        this._d = Math.abs(this._d) < ZeroDist ? 0 : this._d;
        return  this
    }

    transformXY(x: number, y: number): Array<number> {
        let x1 = x * this._a + y * this._c + this._e,
            y1 = x * this._b + y * this._d + this._f;
        return [x1, y1];
    }

    append(mx: WMatrix) {
        if (mx) {
            let a1 = this._a,
                b1 = this._b,
                c1 = this._c,
                d1 = this._d,
                e1 = this._e,
                f1 = this._f,
                a2 = mx._a,
                b2 = mx._c,
                c2 = mx._b,
                d2 = mx._d,
                e2 = mx._e,
                f2 = mx._f;
            this._a = a2 * a1 + b2 * b1;
            this._c = a2 * c1 + b2 * d1;
            this._b = c2 * a1 + d2 * b1;
            this._d = c2 * c1 + d2 * d1;
            this._e = a2 * e1 + b2 * f1 + e2;
            this._f = c2 * e1 + d2 * f1 + e2;
        }
    }
}