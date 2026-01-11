const NOTION_API_BASE = '/api/notion/v1';

export interface NotionPage {
  id: string;
  title: string;
  icon: string;
}

// Helper to extract text from rich_text array
const getRichText = (richTextArray: any[]) => {
  if (!richTextArray || richTextArray.length === 0) return '';
  return richTextArray.map(t => t.plain_text).join('');
};

// Helper to convert blocks to Markdown
const blocksToMarkdown = (blocks: any[]): string => {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading_1':
        return `# ${getRichText(block.heading_1.rich_text)}
`;
      case 'heading_2':
        return `## ${getRichText(block.heading_2.rich_text)}
`;
      case 'heading_3':
        return `### ${getRichText(block.heading_3.rich_text)}
`;
      case 'paragraph':
        return `${getRichText(block.paragraph.rich_text)}
`;
      case 'bulleted_list_item':
        return `- ${getRichText(block.bulleted_list_item.rich_text)}
`;
      case 'numbered_list_item':
        return `1. ${getRichText(block.numbered_list_item.rich_text)}
`;
      case 'to_do':
        const checked = block.to_do.checked ? 'x' : ' ';
        return `- [${checked}] ${getRichText(block.to_do.rich_text)}
`;
      case 'quote':
        return `> ${getRichText(block.quote.rich_text)}
`;
      case 'code':
        return `\`\`\`${block.code.language}\n${getRichText(block.code.rich_text)}\n\`\`\`\n`;
      default:
        return '';
    }
  }).join('\n');
};

export const notionService = {
  searchPages: async (apiKey: string): Promise<NotionPage[]> => {
    try {
      const response = await fetch(`${NOTION_API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filter: {
            value: 'page',
            property: 'object'
          },
          sort: {
            direction: 'descending',
            timestamp: 'last_edited_time'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Notion API call failed');
      }

      const data = await response.json();
      
      return data.results.map((page: any) => {
        // Extract title (handles different title property names)
        let title = 'Untitled';
        const properties = page.properties;
        const titleProp = Object.values(properties).find((p: any) => p.type === 'title') as any;
        if (titleProp && titleProp.title) {
          title = getRichText(titleProp.title) || 'Untitled';
        }

        // Extract icon
        let icon = '📄';
        if (page.icon) {
          if (page.icon.type === 'emoji') {
            icon = page.icon.emoji;
          } else if (page.icon.type === 'external') {
            icon = '🖼️'; // Simply use a generic icon for external images
          }
        }

        return {
          id: page.id,
          title,
          icon
        };
      });
    } catch (error) {
      console.error('Error searching Notion pages:', error);
      throw error;
    }
  },

  getPageContent: async (apiKey: string, pageId: string): Promise<string> => {
    try {
      // Fetch blocks (children of the page)
      // Note: This only fetches the first 100 blocks. 
      // For production, pagination (using next_cursor) should be implemented.
      const response = await fetch(`${NOTION_API_BASE}/blocks/${pageId}/children?page_size=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch page content');
      }

      const data = await response.json();
      return blocksToMarkdown(data.results);
    } catch (error) {
      console.error('Error fetching page content:', error);
      throw error;
    }
  }
};