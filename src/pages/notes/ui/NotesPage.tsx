import type { MemoTimelineItem } from '@/entities/timeline/model/types'
import { TagFilterBar } from '@/features/filters/ui/TagFilterBar'
import { MemoGrid } from '@/features/notes/ui/MemoGrid'
import { StatePanel } from '@/shared/ui'
import { useAppShellContext } from '@/widgets/layout/ui/useAppShellContext'

const NOTE_TAGS = ['전체', '아이디어', '프로모션', '세무', '중요', '개인']

export const NotesPage = () => {
  const { timelineItems, notesTag, setNotesTag, ui, selectItem, isLoading, hasError } =
    useAppShellContext()
  const memoItems = timelineItems.filter((item): item is MemoTimelineItem => item.type === 'memo')
  const filteredMemos =
    notesTag === '전체' ? memoItems : memoItems.filter((memo) => memo.tags?.includes(notesTag))

  if (hasError) {
    return (
      <StatePanel
        type="error"
        title="메모를 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요."
      />
    )
  }

  if (isLoading) {
    return (
      <StatePanel type="loading" title="메모 로딩 중" description="메모를 불러오고 있습니다." />
    )
  }

  return (
    <>
      <TagFilterBar tags={NOTE_TAGS} selected={notesTag} onSelect={setNotesTag} />
      {filteredMemos.length ? (
        <MemoGrid memos={filteredMemos} selectedItemId={ui.item} onSelect={selectItem} />
      ) : (
        <StatePanel
          type="empty"
          title="조건에 맞는 메모가 없습니다"
          description="다른 태그를 선택해 보세요."
        />
      )}
    </>
  )
}
