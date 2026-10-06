/** Small scenery and construction props are vector art; the cast uses the original atlases. */
const svg = (body:string) => `<svg viewBox="0 0 200 160" fill="none" aria-hidden="true">${body}</svg>`;
export const picoProps = {
 boat:svg('<path d="M15 100h170l-30 42H48Z" fill="#B77143" stroke="#F8D5A5" stroke-width="5"/><path d="M99 18v82M53 142h102" stroke="#F8D5A5" stroke-width="5"/><path d="M94 25 33 89h61Z" fill="#FFF1D2"/><path d="M107 32v57h55Z" fill="#8ADFD9"/><path d="M12 151q20-12 40 0t40 0t40 0t50 0" stroke="#8ADFD9" stroke-width="6"/>'),
 lighthouse:svg('<path d="M73 44h54l22 105H51Z" fill="#FFF1D2" stroke="#EFC98A" stroke-width="4"/><path d="M66 82h68l5 20H61Z" fill="#ED9383"/><path d="M68 45h64V24H68Z" fill="#83E5ED" stroke="#FFE49A" stroke-width="4"/><path d="m60 24 40-22 40 22Z" fill="#566886"/><path d="M94 34h12v11H94Z" fill="#FFF6CE"/><path d="M91 148v-30h18v30" fill="#43506B"/><path d="M35 150h130" stroke="#EFC98A" stroke-width="5"/>'),
 beam:svg('<path d="M24 75 184 10V150Z" fill="#FFE49A"/>'+'<path d="m24 75 150-30 0 70Z" fill="#FFF6CE" opacity=".55"/>').replace('<svg ','<svg preserveAspectRatio="none" '),
 plank:svg('<rect x="17" y="52" width="166" height="45" rx="8" fill="#DFA66E" stroke="#FFE1AE" stroke-width="4"/><path d="M30 68q40 13 130 0M35 84h115" stroke="#9F714F" stroke-width="3"/>'),
 pontoon:svg('<path d="M23 115v35m42-35v35m70-35v35m42-35v35" stroke="#AF744F" stroke-width="10"/><path d="M18 104h164v24H18Z" fill="#E4CA8B" stroke="#8F6644" stroke-width="4"/><path d="M40 104v24m25-24v24m25-24v24m25-24v24m25-24v24m25-24v24" stroke="#AF744F" stroke-width="3"/>'),
 frame:svg('<path d="M39 150V75l61-60 61 60v75M39 75h122M56 149V80m88 69V80M98 21v125" stroke="#E4CA8B" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'),
 circuit:svg('<rect x="25" y="24" width="150" height="114" rx="15" fill="#315B66" stroke="#C7B5FF" stroke-width="4"/><path d="M45 55h40v50h55V76h20M45 118h22V42h85" stroke="#8ADFD9" stroke-width="6"/><circle cx="44" cy="55" r="9" fill="#FFE49A"/><circle cx="158" cy="76" r="9" fill="#FFE49A"/><circle cx="151" cy="42" r="7" fill="#FFE49A"/>'),
 debris:svg('<path d="m20 101 102-46 13 28-102 47Z" fill="#8F7964"/><path d="m125 80 32 13-8 44-31-11Z" fill="#657C76"/><path d="M55 98 42 37q32 20 23 63" stroke="#799581" stroke-width="8"/>'),
 current:svg('<path d="M10 80q26-70 52 0t52 0t52 0t25-15" stroke="#83E5ED" stroke-width="10" stroke-linecap="round"/><path d="M12 111q26-60 52 0t52 0t52 0" stroke="#FFF6CE" stroke-width="4" opacity=".7"/>'),
 gear:svg('<path d="m90 12 20 0 6 24 21 8 20-12 16 16-12 20 8 21 23 6v20l-23 6-8 21 12 20-16 16-20-12-21 8-6 24H90l-6-24-21-8-20 12-16-16 12-20-8-21-23-6V95l23-6 8-21-12-20 16-16 20 12 21-8Z" transform="translate(20 -5) scale(.78)" fill="#CB9454" stroke="#FFE1AE" stroke-width="5"/><circle cx="100" cy="78" r="25" fill="#43506B" stroke="#FFE1AE" stroke-width="5"/>'),
 basket:svg('<path d="M28 66h144l-14 75H42Z" fill="#C8945D" stroke="#FFE1AE" stroke-width="4"/><path d="M51 70q0-65 49-65t49 65M45 96h110M51 121h98M65 68v70m35-70v70m35-70v70" stroke="#FFE1AE" stroke-width="5"/>'),
 sail:svg('<path d="M96 10v140" stroke="#E4CA8B" stroke-width="5"/><path d="M87 20 20 128h67Z" fill="#FFF6E6"/><path d="m102 27 73 102h-73Z" fill="#8ADFD9"/>'),
} as const;
export type PicoProp = keyof typeof picoProps;
