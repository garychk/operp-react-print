import type { Locale as AntdLocale } from 'antd/es/locale';

import antdZhCN from 'antd/es/locale/zh_CN';
import antdEnUS from 'antd/es/locale/en_US';
import antdJaJP from 'antd/es/locale/ja_JP';

import type { Locale } from './index';

/**
 * antd 内置文案（ColorPicker、Empty、Table、Popconfirm 等）对应的语言包。
 * 通过 antd ConfigProvider 注入，使第三方组件文案跟随 locale 切换。
 */
export const ANTD_LOCALES: Record<Locale, AntdLocale> = {
  'zh-CN': antdZhCN,
  'en-US': antdEnUS,
  'ja-JP': antdJaJP,
};
