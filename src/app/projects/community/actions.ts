'use server';

import { redirect } from 'next/navigation';

export async function navigateToCreateProject() {
  redirect('/');
}

export async function navigateToFilter() {
  // สำหรับอนาคต - อาจเพิ่มการกรองหรือการค้นหา
  // ปัจจุบันยังไม่ทำอะไร
}
