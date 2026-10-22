import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowRight,CalendarDays,ChevronDown} from 'lucide-react';
import ContactCalendar from './ContactCalendar';
import {dateKey,displayDate,homeBudgetOptions,homeProjectTypes,koreaToday} from '../data/contactOptions';
import {submitHomeInquiry,type HomeInquiry} from '../data/contactSubmission';

const empty:HomeInquiry={name:'',company:'',contact:'',projectType:'',deliveryDate:'',budget:'',description:''};
type Field=keyof HomeInquiry;
export function validateHomeField(field:Field,value:string){
  if(field==='budget')return '';
  if(!value.trim())return {name:'이름을 입력해주세요.',company:'회사명을 입력해주세요.',contact:'전화번호 또는 이메일을 입력해주세요.',projectType:'프로젝트 유형을 선택해주세요.',deliveryDate:'희망 납품일을 선택해주세요.',description:'프로젝트 설명을 입력해주세요.'}[field];
  if(field==='contact'){
    if(value.includes('@'))return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())?'':'이메일 형식을 확인해주세요.';
    const digits=value.replace(/\D/g,'');return /^\+?[\d\s().-]+$/.test(value.trim())&&digits.length>=8&&digits.length<=15?'':'전화번호 또는 이메일 형식을 확인해주세요.';
  }
  if(field==='deliveryDate'&&value<dateKey(koreaToday()))return '오늘 이후 날짜를 선택해주세요.';
  return '';
}

export default function ContactForm({calendarHost}:{calendarHost:HTMLDivElement|null}){
  const [values,setValues]=useState<HomeInquiry>(empty);
  const [errors,setErrors]=useState<Partial<Record<Field,string>>>({});
  const [open,setOpen]=useState(false);
  const [wide,setWide]=useState(false);
  const [status,setStatus]=useState('');
  const [busy,setBusy]=useState(false);
  const form=useRef<HTMLFormElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const dateArea=useRef<HTMLDivElement>(null);
  const calendar=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const media=window.matchMedia('(min-width:1024px)');const update=()=>setWide(media.matches);
    update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);
  },[]);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{const target=event.target as Node;if(!dateArea.current?.contains(target)&&!calendar.current?.contains(target))setOpen(false);};
    const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();setOpen(false);trigger.current?.focus({preventScroll:true});}};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);};
  },[open]);
  function update(field:Field,value:string){
    setValues(current=>({...current,[field]:value}));
    setErrors(current=>current[field]?{...current,[field]:validateHomeField(field,value)}:current);
    setStatus('');
  }
  const error=(field:Field)=>errors[field]?<small className="hc-error" id={`hc-${field}-error`}>{errors[field]}</small>:null;
  const required=<i className="hc-required" aria-hidden="true"/>;
  const input=(field:'name'|'company'|'contact',label:string,placeholder:string)=><div className="hc-field">
    <label htmlFor={`hc-${field}`}>{label}{required}</label>
    <input id={`hc-${field}`} name={field} value={values[field]} onChange={event=>update(field,event.target.value)}
      placeholder={placeholder} autoComplete={field==='name'?'name':field==='company'?'organization':'off'}
      aria-required="true" aria-invalid={!!errors[field]} aria-describedby={errors[field]?`hc-${field}-error`:undefined}/>{error(field)}
  </div>;
  const picker=open?<ContactCalendar value={values.deliveryDate} calendarRef={calendar} onSelect={value=>{update('deliveryDate',value);setOpen(false);trigger.current?.focus({preventScroll:true});}}/>:null;
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();const next:Partial<Record<Field,string>>={};
    for(const field of Object.keys(values) as Field[]){const message=validateHomeField(field,values[field]);if(message)next[field]=message;}
    setErrors(next);if(Object.keys(next).length){setStatus('입력 내용을 확인해주세요.');requestAnimationFrame(()=>form.current?.querySelector<HTMLElement>('input[aria-invalid=true],button[aria-invalid=true],textarea[aria-invalid=true]')?.focus());return;}
    setBusy(true);
    try{await submitHomeInquiry(values);setStatus('입력 검증이 완료되었습니다. 문의 전송 서비스가 연결되지 않아 전송되지 않았습니다.');}
    catch{setStatus('처리에 실패했습니다. 입력 내용은 유지됩니다.');}
    finally{setBusy(false);}
  }
  return <form className="hc-form" ref={form} onSubmit={submit} noValidate>
    <div className="hc-form-row">{input('name','이름','이름을 입력해주세요.')}{input('company','회사명','회사명을 입력해주세요.')}</div>
    {input('contact','연락처','연락 가능한 전화번호 또는 이메일을 입력해주세요.')}
    <fieldset className="hc-types" aria-describedby={errors.projectType?'hc-projectType-error':undefined}>
      <legend>프로젝트 유형{required}</legend><div className="hc-chips">{homeProjectTypes.map((type,index)=><label key={type}>
        <input type="radio" name="projectType" id={`hc-type-${index}`} value={type} checked={values.projectType===type}
          onChange={()=>update('projectType',type)} aria-required="true" aria-invalid={!!errors.projectType}/><span>{type}</span>
      </label>)}</div>{error('projectType')}
    </fieldset>
    <div className="hc-form-row hc-date-budget">
      <div className="hc-field hc-date-field" ref={dateArea}>
        <label htmlFor="hc-deliveryDate">희망 납품일{required}</label>
        <button className={`hc-date-trigger ${values.deliveryDate?'has-value':''}`} id="hc-deliveryDate" ref={trigger} type="button"
          onClick={()=>setOpen(current=>!current)} aria-label="희망 납품일 선택" aria-haspopup="dialog" aria-expanded={open}
          aria-controls={open?'hc-calendar':undefined} aria-required="true" aria-invalid={!!errors.deliveryDate}
          aria-describedby={errors.deliveryDate?'hc-deliveryDate-error':undefined}>
          <span>{displayDate(values.deliveryDate)||'날짜를 선택해주세요.'}</span><CalendarDays size={19} strokeWidth={1.4}/>
        </button><input type="hidden" name="deliveryDate" value={values.deliveryDate}/>{error('deliveryDate')}
        {open&&(wide&&calendarHost?createPortal(picker,calendarHost):picker)}
      </div>
      <div className="hc-field hc-budget"><label htmlFor="hc-budget">예상 예산</label><div className="hc-select-wrap">
        <select name="budget" id="hc-budget" value={values.budget} onChange={event=>update('budget',event.target.value)}>
          <option value="">예산을 선택해주세요.</option>{homeBudgetOptions.map(option=><option key={option}>{option}</option>)}
        </select><ChevronDown size={17} strokeWidth={1.4} aria-hidden="true"/>
      </div></div>
    </div>
    <div className="hc-field hc-description"><label htmlFor="hc-description">프로젝트에 대해 자유롭게 알려주세요.{required}</label>
      <textarea id="hc-description" name="description" rows={3} value={values.description} onChange={event=>update('description',event.target.value)}
        placeholder="영상의 목적, 참고 자료, 원하시는 스타일 등을 최대한 자세히 적어주시면 더 정확한 상담이 가능합니다."
        aria-required="true" aria-invalid={!!errors.description} aria-describedby={errors.description?'hc-description-error':undefined}/>{error('description')}
    </div>
    <button className="hc-submit" type="submit" disabled={busy}>{busy?'확인 중…':'제출하기'}<ArrowRight size={24} strokeWidth={1.2}/></button>
    <p className="hc-service-note">문의 전송 서비스 연결 전입니다. 입력 정보는 서버에 저장되거나 전송되지 않습니다.</p>
    <p className="hc-status" role="status">{status}</p>
  </form>;
}
