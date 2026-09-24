const segments = ['abcdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc','abcdefg','abcdfg'];
export function DigitalNumber({value,pad=1}:{value:number;pad?:number}) {
  return <span className="digital-number" role="img" aria-label={String(value)}>{String(value).padStart(pad,'0').split('').map((digit,i)=><span className="digital-digit" key={i} aria-hidden="true">{'abcdefg'.split('').map(segment=><i key={segment} className={`segment segment-${segment} ${segments[Number(digit)].includes(segment)?'segment-on':''}`}/>)}</span>)}</span>;
}
