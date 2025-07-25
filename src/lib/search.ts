import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { ParserService } from './parser.service';


export interface InstagramResponse {
  resultsCount: number;
  urls: string[];
  postInfo: {
    ownerUsername: string;
    ownerName: string;
    isVerified: boolean;
    isPrivate: boolean;
    commentsDisabled: boolean;
    likeCounterDisabled: boolean;
    location: string;
    likes: number;
    followers: number;
    isAd: boolean;
    caption: string;
    createdAt: number;
  };
  media: {
    createdAt: number;
    type: string;
    dimensions: {
      height: number;
      width: number;
    };
    url: string;
    videoViewCount?: number;
    thumbnail?: string;
  }[];
}

export async function getDetails(url: string, config :any): Promise<InstagramResponse> {
  const parserService = new ParserService();
  const httpClient = new HTTP();

    try {
      const urlParts = url.split('/');
      const tags = ['p', 'reel', 'tv', 'reels'];
      const index = urlParts.findIndex(item => tags.includes(item)) + 1;
      const id = urlParts[index];

      const data = await parserService.getData(httpClient, id, config.retries, config.delay);

      return parserService.createResponse(data);
    } catch (err: any) {
      throw new Error(`Instagram error: ${err.message}`);
    }
  }
