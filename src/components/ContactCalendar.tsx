import {useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import {dateKey,koreaToday,parseDate} from '../data/contactOptions';

export default function ContactCalendar({value,onSelect,calendarRef}:{
  value:string;onSelect:(value:string)=>void;calendarRef:React.RefObject<HTMLDivElement|null>;
}){
  const today=koreaToday();
  const initial=value?parseDate(value):today;
  const [month,setMonth]=useState(()=>new Date(initial.getFullYear(),initial.getMonth(),1));
  const [focused,setFocused]=useState(()=>dateKey(initial));
  const focusRequested=useRef(true);
  const firstDay=new Date(month.getFullYear(),month.getMonth(),1).getDay();
  const dayCount=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const cells=Array.from({length:Math.ceil((firstDay+dayCount)/7)*7},(_,i)=>i-firstDay+1);
  const previousDisabled=new Date(month.getFullYear(),month.getMonth(),1)<=new Date(today.getFullYear(),today.getMonth(),1);
  useEffect(()=>{
    if(focusRequested.current){calendarRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus({preventScroll:true});focusRequested.current=false;}
  },[focused,month,calendarRef]);
  function changeMonth(direction:number){
    const next=new Date(month.getFullYear(),month.getMonth()+direction,1);
    setMonth(next);setFocused(dateKey(next<today?today:next));
  }
  function navigate(event:React.KeyboardEvent<HTMLButtonElement>,date:Date){
    const amount:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};
    let next:Date;
    if(event.key in amount)next=new Date(date.getFullYear(),date.getMonth(),date.getDate()+amount[event.key]);
    else if(event.key==='Home')next=new Date(date.getFullYear(),date.getMonth(),date.getDate()-date.getDay());
    else if(event.key==='End')next=new Date(date.getFullYear(),date.getMonth(),date.getDate()+6-date.getDay());
    else if(event.key==='PageUp'||event.key==='PageDown'){
      const targetMonth=date.getMonth()+(event.key==='PageUp'?-1:1);
      const limit=new Date(date.getFullYear(),targetMonth+1,0).getDate();
      next=new Date(date.getFullYear(),targetMonth,Math.min(date.getDate(),limit));
    }else return;
    event.preventDefault();if(next<today)next=today;
    focusRequested.current=true;setFocused(dateKey(next));setMonth(new Date(next.getFullYear(),next.getMonth(),1));
  }
  return <div className="hc-calendar" id="hc-calendar" role="dialog" aria-label="희망 납품일 선택 달력" ref={calendarRef}>
    <div className="hc-calendar-heading"><button type="button" onClick={()=>changeMonth(-1)} disabled={previousDisabled} aria-label="이전 달"><ChevronLeft size={18}/></button>
      <strong aria-live="polite">{month.getFullYear()}년 {month.getMonth()+1}월</strong>
      <button type="button" onClick={()=>changeMonth(1)} aria-label="다음 달"><ChevronRight size={18}/></button></div>
    <table aria-label={`${month.getFullYear()}년 ${month.getMonth()+1}월 날짜`}><thead><tr>{['일','월','화','수','목','금','토'].map(day=><th scope="col" key={day}>{day}</th>)}</tr></thead>
      <tbody>{Array.from({length:cells.length/7},(_,row)=><tr key={row}>{cells.slice(row*7,row*7+7).map((day,column)=>{
        if(day<1||day>dayCount)return <td key={column}/>;
        const date=new Date(month.getFullYear(),month.getMonth(),day);const key=dateKey(date);const disabled=date<today;
        return <td key={column}><button type="button" data-date={key} disabled={disabled} tabIndex={focused===key?0:-1}
          aria-label={`${date.getFullYear()}년 ${date.getMonth()+1}월 ${day}일`} aria-pressed={value===key}
          aria-current={key===dateKey(today)?'date':undefined}
          onKeyDown={event=>navigate(event,date)} onClick={()=>onSelect(key)}>{day}</button></td>;
      })}</tr>)}</tbody></table>
  </div>;
}
