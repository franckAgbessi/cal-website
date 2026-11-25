

import { article } from './documents/article';
import { homePage } from './documents/homePage';
import { aboutPage, author, category, contactPage, historyPage, siteSettings } from './documents/siteDocuments';
import { cta, editorialSection, historicalReference, richImage, seo } from './objects/shared';

export const schemaTypes = [cta, seo, richImage, editorialSection, historicalReference, homePage, article, category, author, siteSettings, aboutPage, historyPage, contactPage];
