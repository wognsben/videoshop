export interface HomeInquiry {
  name:string;company:string;contact:string;projectType:string;deliveryDate:string;budget:string;description:string;
}

// HOME용 API 계약은 아직 없습니다. 외부 전송이나 가짜 접수를 하지 않습니다.
export async function submitHomeInquiry(_inquiry:HomeInquiry):Promise<{status:'not-configured'}>{
  void _inquiry;
  return {status:'not-configured'};
}

