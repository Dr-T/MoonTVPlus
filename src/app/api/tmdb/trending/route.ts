import { NextResponse } from 'next/server';
import { getTMDBTrendingContent } from '@/lib/tmdb.client';
import { getConfig } from '@/lib/config';

// 缓存配置 - 服务器内存缓存3小时
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3小时
let cachedData: { data: any; timestamp: number } | null = null;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 检查缓存
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json(cachedData.data);
    }

    // 获取配置
    const config = await getConfig();
    const apiKey = config.SiteConfig?.TMDBApiKey;
    const proxy = config.SiteConfig?.TMDBProxy;

    if (!apiKey) {
      return NextResponse.json(
        { code: 400, message: 'TMDB API Key 未配置' },
        { status: 400 }
      );
    }

    // 获取热门内容
    const result = await getTMDBTrendingContent(apiKey, proxy);

    // 更新缓存
    cachedData = {
      data: result,
      timestamp: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('获取 TMDB 热门内容失败:', error);
    return NextResponse.json(
      { code: 500, message: '获取热门内容失败' },
      { status: 500 }
    );
  }
}
