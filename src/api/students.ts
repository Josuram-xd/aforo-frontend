import { isMockMode } from '../lib/env'
import { supabase } from '../lib/supabase'
import type { TablesInsert } from '../types/database'
import { fromPostgrest } from './errors'
import type { Student } from './types'

// Students: teacher/admin read and write (RLS). Deleting goes only through the delete_student RPC,
// which also strips the student's personal data from the audit log (aforo-db tasks 11 and 12).

const mock = () => import('./mock/mockApi')

export const PHOTO_BUCKET = 'student-photos'

export type StudentInput = Pick<
  TablesInsert<'students'>,
  'full_name' | 'email' | 'student_code' | 'photo_path'
>

export async function fetchStudents(): Promise<Student[]> {
  if (isMockMode) return (await mock()).fetchStudents()
  const { data, error } = await supabase.from('students').select('*').order('full_name')
  if (error) throw fromPostgrest(error)
  return data
}

/** Creates (no id) or updates a student; returns the student id. */
export async function saveStudent(input: StudentInput, id?: string): Promise<string> {
  if (isMockMode) {
    await (await mock()).saveStudent(input, id)
    return id ?? ''
  }
  if (id) {
    const { error } = await supabase.from('students').update(input).eq('id', id)
    if (error) throw fromPostgrest(error)
    return id
  }
  const { data, error } = await supabase.from('students').insert(input).select('id').single()
  if (error) throw fromPostgrest(error)
  return data.id
}

export async function setStudentActive(id: string, isActive: boolean): Promise<void> {
  if (isMockMode) return (await mock()).setStudentActive(id, isActive)
  const { error } = await supabase.from('students').update({ is_active: isActive }).eq('id', id)
  if (error) throw fromPostgrest(error)
}

/** Permanent deletion: attendance goes with it; past events stay, without the name. */
export async function deleteStudent(student: Pick<Student, 'id' | 'photo_path'>): Promise<void> {
  if (isMockMode) return (await mock()).deleteStudent(student.id)
  const { error } = await supabase.rpc('delete_student', { p_student_id: student.id })
  if (error) throw fromPostgrest(error)
  // The row is gone; the stored photo must go too (best effort: a failure leaves an orphan file).
  if (student.photo_path) await supabase.storage.from(PHOTO_BUCKET).remove([student.photo_path])
}

/** Uploads the optional photo (already a small JPEG) and returns its storage path. */
export async function uploadStudentPhoto(studentId: string, photo: Blob): Promise<string> {
  if (isMockMode) return `${studentId}/mock.jpg`
  const path = `${studentId}/${Date.now()}.jpg`
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, photo, { contentType: 'image/jpeg' })
  if (error) throw fromPostgrest({ message: error.message })
  return path
}

export async function removeStudentPhoto(path: string): Promise<void> {
  if (isMockMode) return
  await supabase.storage.from(PHOTO_BUCKET).remove([path])
}

/** Short-lived signed URLs for the private photos, keyed by storage path. */
export async function fetchPhotoUrls(paths: string[]): Promise<Record<string, string>> {
  if (isMockMode || paths.length === 0) return {}
  const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 3600)
  if (error) throw fromPostgrest({ message: error.message })
  const urls: Record<string, string> = {}
  for (const item of data) if (item.path && item.signedUrl) urls[item.path] = item.signedUrl
  return urls
}

/** Sends 3-8 face photos (base64 JPEG) that the vision node turns into an embedding and then erases. */
export async function submitEnrollment(studentId: string, images: string[]): Promise<void> {
  if (isMockMode) return (await mock()).submitEnrollment(studentId)
  const { error } = await supabase.rpc('submit_enrollment', {
    p_student_id: studentId,
    p_images: images,
  })
  if (error) throw fromPostgrest(error)
}
