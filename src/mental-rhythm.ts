/** The training difficulty controls the clock; it is frozen when a session starts. */
export function mentalTrainingRhythm(level:number):{duration:10|15|null;lives:3|5|null} {
 if(!Number.isInteger(level)||level<0||level>2)throw new RangeError('Niveau mental invalide');
 return level===0?{duration:null,lives:null}:level===1?{duration:15,lives:5}:{duration:10,lives:3};
}
