const BOM_REGEX = /^(?:\uFEFF|\uFFFE|\u00EF\u00BB\u00BF|\u00FF\u00FE|\u00FE\u00FF|\u0000\u0000\u00FE\u00FF|\u00FF\u00FE\u0000\u0000)/;

export const stripBom = (text) => text.replace(BOM_REGEX, '');