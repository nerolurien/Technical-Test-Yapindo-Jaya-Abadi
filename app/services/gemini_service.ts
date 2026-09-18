import { GoogleGenAI, Type } from '@google/genai'
import env from '#start/env'

const ai = new GoogleGenAI({ apiKey: env.get('GEMINI_API_KEY') })

export async function parseNaturalLanguageTaskCommand(prompt: string) {
  const systemInstruction = `
  Kamu adalah asisten backend untuk task management.
  Tugasmu memetakan bahasa alami menjadi daftar aksi untuk tabel 'tasks'.

  ATURAN KEAMANAN:
  1. HANYA operasikan tabel 'tasks'. DILARANG KERAS mengubah atau menghapus data tabel 'users'.
  2. JIKA prompt terdeteksi meminta menghapus, mengubah, atau membuat data 'user/pengguna', set properti "rejected" menjadi true dan isi "rejectionReason". Kosongkan array "actions".
  3. Action yang valid hanya: 'CREATE', 'UPDATE', 'DELETE'.
  `

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rejected: { type: Type.BOOLEAN },
          rejectionReason: { type: Type.STRING, nullable: true },
          actions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING, enum: ['CREATE', 'UPDATE', 'DELETE'] },
                taskId: { type: Type.INTEGER, nullable: true },
                projectId: { type: Type.INTEGER, nullable: true },
                title: { type: Type.STRING, nullable: true },
                description: { type: Type.STRING, nullable: true },
                status: { type: Type.STRING, enum: ['todo', 'in_progress', 'done'], nullable: true },
                priority: { type: Type.STRING, enum: ['low', 'medium', 'high'], nullable: true },
                assigneeId: { type: Type.INTEGER, nullable: true }
              },
              required: ['action']
            }
          }
        },
        required: ['rejected', 'actions']
      }
    }
  })

  return JSON.parse(response.text!)
}