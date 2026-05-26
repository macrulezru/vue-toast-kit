import type { ToastItem } from './types'

export class GroupManager {
  private groups = new Map<string, string[]>()
  private expandedGroups = new Set<string>()

  private getItems: (ids: string[]) => ToastItem[]
  private hideItem: (id: string) => void
  private showItem: (id: string) => void

  constructor(
    getItems: (ids: string[]) => ToastItem[],
    hideItem: (id: string) => void,
    showItem: (id: string) => void,
  ) {
    this.getItems = getItems
    this.hideItem = hideItem
    this.showItem = showItem
  }

  add(id: string, groupKey: string): void {
    if (!this.groups.has(groupKey)) {
      this.groups.set(groupKey, [id])
      return
    }

    const ids = this.groups.get(groupKey)!
    ids.push(id)

    const [leaderId] = ids
    const leader = this.getItems([leaderId])[0]
    if (leader) {
      leader.groupCount.value = ids.length
    }

    if (!this.expandedGroups.has(groupKey)) {
      this.hideItem(id)
    }
  }

  remove(id: string, groupKey: string): void {
    const ids = this.groups.get(groupKey)
    if (!ids) return

    const idx = ids.indexOf(id)
    if (idx === -1) return

    ids.splice(idx, 1)

    if (ids.length === 0) {
      this.groups.delete(groupKey)
      this.expandedGroups.delete(groupKey)
      return
    }

    const [leaderId] = ids
    const leader = this.getItems([leaderId])[0]
    if (leader) {
      leader.groupCount.value = ids.length
    }

    if (idx === 0 && ids.length > 0) {
      this.showItem(ids[0])
      if (!this.expandedGroups.has(groupKey)) {
        for (let i = 1; i < ids.length; i++) {
          this.hideItem(ids[i])
        }
      }
    }
  }

  toggleExpand(groupKey: string): void {
    const ids = this.groups.get(groupKey)
    if (!ids) return

    if (this.expandedGroups.has(groupKey)) {
      this.expandedGroups.delete(groupKey)
      for (let i = 1; i < ids.length; i++) {
        this.hideItem(ids[i])
      }
    } else {
      this.expandedGroups.add(groupKey)
      for (const id of ids) {
        this.showItem(id)
      }
    }
  }

  isExpanded(groupKey: string): boolean {
    return this.expandedGroups.has(groupKey)
  }

  getGroupIds(groupKey: string): string[] {
    return this.groups.get(groupKey) ?? []
  }

  hasGroup(groupKey: string): boolean {
    return this.groups.has(groupKey)
  }

  clear(): void {
    this.groups.clear()
    this.expandedGroups.clear()
  }
}
