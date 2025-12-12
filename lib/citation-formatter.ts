// Citation formatting utility for different citation styles

export type CitationStyle = 'APA' | 'IEEE' | 'MLA' | 'Chicago' | 'Harvard' | 'Vancouver';

export interface Publication {
  title?: string;
  authors?: string;
  year?: string;
  journal?: string;
  conference?: string;
  volume?: string;
  number?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publicationType?: 'journal' | 'conference';
}

export function formatCitation(pub: Publication, style: CitationStyle): string {
  const authors = pub.authors || '';
  const title = pub.title || '';
  const year = pub.year || '';
  const journal = pub.journal || '';
  const conference = pub.conference || '';
  const venue = journal || conference;
  const volume = pub.volume || '';
  const number = pub.number || '';
  const pages = pub.pages || '';
  const doi = pub.doi || '';
  
  switch (style) {
    case 'APA':
      // Authors (Year). Title. Journal, Volume(Number), pages.
      return `${authors}${year ? ` (${year})` : ''}. ${title}. ${
        venue ? `${venue}${volume ? `, ${volume}` : ''}${number ? `(${number})` : ''}${pages ? `, ${pages}` : ''}` : ''
      }${doi ? `. https://doi.org/${doi}` : ''}`.trim();
    
    case 'IEEE':
      // [#] Authors, "Title," Journal, vol. #, no. #, pp. #-#, Year.
      return `${authors}, "${title}," ${
        venue ? `${venue}${volume ? `, vol. ${volume}` : ''}${number ? `, no. ${number}` : ''}${pages ? `, pp. ${pages}` : ''}` : ''
      }${year ? `, ${year}` : ''}.`.trim();
    
    case 'MLA':
      // Authors. "Title." Journal Volume.Number (Year): pages.
      return `${authors}. "${title}." ${
        venue ? `${venue}${volume ? ` ${volume}` : ''}${number ? `.${number}` : ''}` : ''
      }${year ? ` (${year})` : ''}${pages ? `: ${pages}` : ''}.`.trim();
    
    case 'Chicago':
      // Authors. "Title." Journal Volume, no. Number (Year): pages.
      return `${authors}. "${title}." ${
        venue ? `${venue}${volume ? ` ${volume}` : ''}${number ? `, no. ${number}` : ''}` : ''
      }${year ? ` (${year})` : ''}${pages ? `: ${pages}` : ''}.`.trim();
    
    case 'Harvard':
      // Authors (Year) 'Title', Journal, Volume(Number), pp. pages.
      return `${authors}${year ? ` (${year})` : ''} '${title}', ${
        venue ? `${venue}${volume ? `, ${volume}` : ''}${number ? `(${number})` : ''}` : ''
      }${pages ? `, pp. ${pages}` : ''}.`.trim();
    
    case 'Vancouver':
      // Authors. Title. Journal. Year;Volume(Number):pages.
      return `${authors}. ${title}. ${venue ? `${venue}. ` : ''}${year ? `${year}` : ''}${
        volume ? `;${volume}` : ''
      }${number ? `(${number})` : ''}${pages ? `:${pages}` : ''}.`.trim();
    
    default:
      return `${authors}${year ? ` (${year})` : ''}. ${title}. ${venue}${volume ? `, ${volume}` : ''}${pages ? `, ${pages}` : ''}.`.trim();
  }
}

export function formatPublicationNumber(
  index: number, 
  publicationType: 'journal' | 'conference' | undefined,
  numberingStyle: 'sequential' | 'grouped'
): string {
  if (numberingStyle === 'grouped') {
    const prefix = publicationType === 'journal' ? 'J' : publicationType === 'conference' ? 'C' : '';
    return `[${prefix}${index + 1}]`;
  }
  return `[${index + 1}]`;
}
