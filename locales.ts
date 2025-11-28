export type Language = 'en' | 'th';

export const translations = {
  en: {
    app: {
      slogan: "Capture ideas instantly.",
      searchPlaceholder: "Search ideas...",
      recordButton: "Record Idea",
      settings: "Settings"
    },
    noteList: {
      emptyTitle: "No notes found.",
      emptySubtitle: "Start recording to capture your ideas.",
      processingTitle: "Processing Idea...",
      processingSubtitle: "AI is listening to your audio and extracting key insights...",
      audioDuration: "s audio",
      dateFormat: "en-US"
    },
    recordOverlay: {
      title: "Recording Idea",
      tapToFinish: "Tap square to finish",
      micAccessError: "Microphone access denied or not available. Please check permissions."
    },
    noteDetail: {
      capturedOn: "Captured on",
      at: "at",
      summary: "Summary",
      keyPoints: "Key Points",
      actionItems: "Action Items",
      transcript: "Transcript",
      noKeyPoints: "No key points extracted.",
      noActionItems: "No action items detected.",
      deleteConfirm: "Are you sure you want to delete this note?",
      deleteTooltip: "Delete Note",
      exportTooltip: "Export Text",
      dateFormat: "en-US"
    },
    settingsModal: {
      title: "Settings",
      language: "Language",
      dataManagement: "Data Management",
      backupDesc: "Your notes are stored locally on this device. Create a backup file to keep your data safe or transfer it to another device.",
      backupBtn: "Backup All Data",
      restoreBtn: "Restore Backup",
      clearBtn: "Clear Local Storage",
      clearConfirm: "Are you sure? This will delete ALL notes permanently. This cannot be undone.",
      status: {
        loading: "Processing...",
        backupSuccess: "Backup downloaded successfully.",
        backupError: "Failed to export data.",
        restoreSuccess: "Data restored successfully.",
        restoreError: "Failed to import. Invalid file.",
        clearSuccess: "All data cleared.",
        clearError: "Failed to clear data."
      }
    }
  },
  th: {
    app: {
      slogan: "บันทึกไอเดียได้ทันที",
      searchPlaceholder: "ค้นหาไอเดีย...",
      recordButton: "บันทึกเสียง",
      settings: "การตั้งค่า"
    },
    noteList: {
      emptyTitle: "ไม่พบโน้ต",
      emptySubtitle: "เริ่มบันทึกเพื่อเก็บไอเดียของคุณ",
      processingTitle: "กำลังประมวลผล...",
      processingSubtitle: "AI กำลังฟังและสรุปใจความสำคัญ...",
      audioDuration: "วินาที",
      dateFormat: "th-TH"
    },
    recordOverlay: {
      title: "กำลังบันทึก",
      tapToFinish: "แตะสี่เหลี่ยมเพื่อเสร็จสิ้น",
      micAccessError: "ไม่สามารถเข้าถึงไมโครโฟนได้ โปรดตรวจสอบสิทธิ์การเข้าถึง"
    },
    noteDetail: {
      capturedOn: "บันทึกเมื่อ",
      at: "เวลา",
      summary: "สรุป",
      keyPoints: "ประเด็นสำคัญ",
      actionItems: "สิ่งที่ต้องทำ",
      transcript: "คำถอดความ",
      noKeyPoints: "ไม่พบประเด็นสำคัญ",
      noActionItems: "ไม่มีสิ่งที่ต้องทำ",
      deleteConfirm: "คุณแน่ใจหรือไม่ว่าต้องการลบโน้ตนี้?",
      deleteTooltip: "ลบโน้ต",
      exportTooltip: "ส่งออกข้อความ",
      dateFormat: "th-TH"
    },
    settingsModal: {
      title: "การตั้งค่า",
      language: "ภาษา",
      dataManagement: "จัดการข้อมูล",
      backupDesc: "โน้ตของคุณถูกจัดเก็บไว้ในเครื่อง สร้างไฟล์สำรองข้อมูลเพื่อเก็บรักษาข้อมูลหรือย้ายไปยังอุปกรณ์อื่น",
      backupBtn: "สำรองข้อมูลทั้งหมด",
      restoreBtn: "กู้คืนข้อมูล",
      clearBtn: "ล้างข้อมูลในเครื่อง",
      clearConfirm: "คุณแน่ใจหรือไม่? การกระทำนี้จะลบโน้ตทั้งหมดถาวรและไม่สามารถกู้คืนได้",
      status: {
        loading: "กำลังดำเนินการ...",
        backupSuccess: "ดาวน์โหลดไฟล์สำรองข้อมูลสำเร็จ",
        backupError: "ส่งออกข้อมูลไม่สำเร็จ",
        restoreSuccess: "กู้คืนข้อมูลสำเร็จ",
        restoreError: "กู้คืนไม่สำเร็จ ไฟล์ไม่ถูกต้อง",
        clearSuccess: "ล้างข้อมูลเรียบร้อยแล้ว",
        clearError: "ล้างข้อมูลไม่สำเร็จ"
      }
    }
  }
};