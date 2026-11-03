import { isMockMode } from '../lib/env'
import { supabase } from '../lib/supabase'
import type { TablesInsert, TablesUpdate } from '../types/database'
import { fromPostgrest } from './errors'
import type { Camera, Classroom, Course } from './types'

// Classrooms, cameras and courses: readable by every active role, writable by admin (RLS).

const mock = () => import('./mock/mockApi')

export async function fetchClassrooms(): Promise<Classroom[]> {
  if (isMockMode) return (await mock()).fetchClassrooms()
  const { data, error } = await supabase.from('classrooms').select('*').order('name')
  if (error) throw fromPostgrest(error)
  return data
}

export async function saveClassroom(
  input: Pick<TablesInsert<'classrooms'>, 'name' | 'location' | 'max_capacity'>,
  id?: string,
): Promise<void> {
  if (isMockMode) return (await mock()).saveClassroom(input, id)
  const payload: TablesUpdate<'classrooms'> = {
    name: input.name,
    location: input.location,
    max_capacity: input.max_capacity,
  }
  const { error } = id
    ? await supabase.from('classrooms').update(payload).eq('id', id)
    : await supabase
        .from('classrooms')
        .insert({ ...payload, name: input.name, max_capacity: input.max_capacity })
  if (error) throw fromPostgrest(error)
}

export async function deleteClassroom(id: string): Promise<void> {
  if (isMockMode) return (await mock()).deleteClassroom(id)
  const { error } = await supabase.from('classrooms').delete().eq('id', id)
  if (error) throw fromPostgrest(error)
}

export async function fetchCameras(): Promise<Camera[]> {
  if (isMockMode) return (await mock()).fetchCameras()
  const { data, error } = await supabase
    .from('cameras')
    .select('*')
    .order('position', { ascending: false })
  if (error) throw fromPostgrest(error)
  return data
}

export async function renameCamera(id: string, name: string): Promise<void> {
  if (isMockMode) return (await mock()).renameCamera(id, name)
  const { error } = await supabase.from('cameras').update({ name }).eq('id', id)
  if (error) throw fromPostgrest(error)
}

export async function fetchCourses(): Promise<Course[]> {
  if (isMockMode) return (await mock()).fetchCourses()
  const { data, error } = await supabase.from('courses').select('*').order('name')
  if (error) throw fromPostgrest(error)
  return data
}

export async function saveCourse(
  input: Pick<TablesInsert<'courses'>, 'code' | 'name' | 'academic_period' | 'is_active'>,
  id?: string,
): Promise<void> {
  if (isMockMode) return (await mock()).saveCourse(input, id)
  const { error } = id
    ? await supabase.from('courses').update(input).eq('id', id)
    : await supabase.from('courses').insert(input)
  if (error) throw fromPostgrest(error)
}

export async function deleteCourse(id: string): Promise<void> {
  if (isMockMode) return (await mock()).deleteCourse(id)
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw fromPostgrest(error)
}
