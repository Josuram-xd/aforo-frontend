import { isMockMode } from '../lib/env'
import { supabase } from '../lib/supabase'
import type { TablesInsert } from '../types/database'
import { fromPostgrest } from './errors'
import type { Student } from './types'

// Students: teacher/admin read, admin writes (RLS). No hard delete from the UI: deactivate.

const mock = () => import('./mock/mockApi')

export type StudentInput = Pick<TablesInsert<'students'>, 'full_name' | 'email' | 'student_code'>

export async function fetchStudents(): Promise<Student[]> {
  if (isMockMode) return (await mock()).fetchStudents()
  const { data, error } = await supabase.from('students').select('*').order('full_name')
  if (error) throw fromPostgrest(error)
  return data
}

export async function saveStudent(input: StudentInput, id?: string): Promise<void> {
  if (isMockMode) return (await mock()).saveStudent(input, id)
  const { error } = id
    ? await supabase.from('students').update(input).eq('id', id)
    : await supabase.from('students').insert(input)
  if (error) throw fromPostgrest(error)
}

export async function setStudentActive(id: string, isActive: boolean): Promise<void> {
  if (isMockMode) return (await mock()).setStudentActive(id, isActive)
  const { error } = await supabase.from('students').update({ is_active: isActive }).eq('id', id)
  if (error) throw fromPostgrest(error)
}
