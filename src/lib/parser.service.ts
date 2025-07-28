import { InstagramResponse } from './search';

export class ParserService {

  async getToken(httpClient: any) {
    const response = await httpClient.get('https://www.instagram.com/', {}, {});

    const setCookie = response.headers['set-cookie'] || response.headers['Set-Cookie'];
    if (!setCookie) throw new Error('CSRF token not found.');

    const csrfCookie = setCookie.split(';').find((c: any) => c.includes('csrftoken='));
    if (!csrfCookie) throw new Error('CSRF token not found in cookie string.');

    return csrfCookie.split('=')[1];
  }

  async getData(httpClient: any, shortcode: string, retries: number, delay: number): Promise<any> {
    const BASE_URL = 'https://www.instagram.com/graphql/query';
    const INSTAGRAM_DOCUMENT_ID = '9510064595728286';
    try {

      const body = {
        variables: JSON.stringify({
          shortcode,
          fetch_tagged_user_count: null,
          hoisted_comment_id: null,
          hoisted_reply_id: null
        }),
        doc_id: INSTAGRAM_DOCUMENT_ID
      };

      const csrfToken = await this.getToken(httpClient);

      const headers = {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/x-www-form-urlencoded'
      };

      httpClient.setDataSerializer('urlencoded');
      const response = await httpClient.post(BASE_URL, body, headers);
      const data = JSON.parse(response.data);
      if (!data.data?.xdt_shortcode_media) {
        throw new Error("Unsupported type or private content");
      }
      return data.data.xdt_shortcode_media;
    } catch (err: any) {
      if (retries > 0 && (err.status === 429 || err.status === 403)) {
        await new Promise(res => setTimeout(res, delay));
        return this.getData(httpClient, shortcode, retries - 1, delay * 2);
      }

      throw new Error(`Instagram request failed with retries: ${err.error || err.message}`);
    }
  }

  private formatPostInfo(data: any) {
    const captionEdges = data?.edge_media_to_caption?.edges || [];
    const caption = captionEdges.length > 0 ? captionEdges[0]?.node?.text ?? '' : '';
    const createdAt = captionEdges.length > 0 ? captionEdges[0]?.node?.created_at ?? null : null;

    return {
      username: data?.owner?.username ?? '',
      name: data?.owner?.full_name ?? '',
      isVerified: data?.owner?.is_verified ?? false,
      isPrivate: data?.owner?.is_private ?? false,
      commentsDisabled: data?.comments_disabled ?? false,
      likeCounterDisabled: data?.like_and_view_counts_disabled ?? false,
      location: data?.location?.name ?? '',
      followers: data?.owner?.edge_followed_by?.count ?? null,
      likes: data?.edge_media_preview_like?.count ?? 0,
      isAd: data?.is_ad ?? false,
      caption,
      createdAt
    };
  }

  private formatMediaDetails(media: any) {
    const fallbackDimensions = { width: 0, height: 0 };

    let bestImageUrl = media?.display_url ?? '';
    let bestDimensions = media?.dimensions ?? fallbackDimensions;

    if (Array.isArray(media?.display_resources) && media.display_resources.length > 0) {
      const sorted = media.display_resources.sort((a: any, b: any) => b.config_width - a.config_width);
      const best = sorted[0];
      if (best?.src) {
        bestImageUrl = best.src;
        bestDimensions = {
          width: best.config_width ?? bestDimensions.width,
          height: best.config_height ?? bestDimensions.height
        };
      }
    }

    if (media?.is_video) {
      return {
        type: 'video',
        dimensions: media?.dimensions ?? fallbackDimensions, // Behalte Original-Video-Dimensionen bei
        videoViewCount: media?.video_view_count ?? 0,
        url: media?.video_url ?? '',
        thumbnail: bestImageUrl
      };
    } else {
      return {
        type: 'image',
        dimensions: bestDimensions,
        url: bestImageUrl
      };
    }
  }

  createResponse(data: any): InstagramResponse {
    const urls: string[] = [];
    const media: any[] = [];

    if (data.__typename === 'XDTGraphSidecar') {
      data.edge_sidecar_to_children.edges.forEach((edge: any) => {
        media.push(this.formatMediaDetails(edge.node));
        urls.push(edge.node.is_video ? edge.node.video_url : edge.node.display_url);
      });
    } else {
      media.push(this.formatMediaDetails(data));
      urls.push(data.is_video ? data.video_url : data.display_url);
    }

    return {
      resultsCount: urls.length,
      urls,
      ...this.formatPostInfo(data),
      media
    };
  }
}
