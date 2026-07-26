import type { DefineComponent } from 'vue'

type WotComponent<Props> = DefineComponent<Props>

export {}

declare module 'vue' {
  export interface GlobalComponents {
    WdButton: WotComponent<typeof import('@wot-ui/ui/components/wd-button/types')['buttonProps']>
    WdCell: WotComponent<typeof import('@wot-ui/ui/components/wd-cell/types')['cellProps']>
    WdCellGroup: WotComponent<typeof import('@wot-ui/ui/components/wd-cell-group/types')['cellGroupProps']>
    WdForm: WotComponent<typeof import('@wot-ui/ui/components/wd-form/types')['formProps']>
    WdFormItem: WotComponent<typeof import('@wot-ui/ui/components/wd-form-item/types')['formItemProps']>
    WdInput: WotComponent<typeof import('@wot-ui/ui/components/wd-input/types')['inputProps']>
    WdTag: WotComponent<typeof import('@wot-ui/ui/components/wd-tag/types')['tagProps']>
  }
}
