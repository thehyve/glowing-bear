export function gradientAscent(
    initialBeta: Array<number>,
    derivative :(beta:Array<number>)=>Array<number>,
    step:number,
    convergenceCriterion: (previous:Array<number>,after:Array<number>)=>boolean,
    maxiter:number
    ):{res:Array<number>,err:Error}{

        var previous=initialBeta
        var next :Array<number>

        for (let index = 0; index < maxiter; index++) {
            var der=derivative(previous)
            for (let j = 0; j < der.length; j++) {
                next[j]=previous[j] + step*der[j]   
            }

            if (convergenceCriterion(previous,next)){
                return {res:next,err:null}
            }
            previous=next
            
        }

        return {res:next,err:new Error("convergence criterion not met")}

    }