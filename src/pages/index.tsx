import { GetStaticProps } from 'next';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';

import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination);

  const handleLoadMorePosts = useCallback(async () => {
    const response = await fetch(posts.next_page);
    const data = await response.json();

    setPosts(state => ({
      ...state,
      ...data,
      results: [...state.results, ...data.results],
    }));
  }, [posts]);

  return (
    <main className={styles.container}>
      <div>
        <img src="/images/Logo.svg" alt="logo" />

        {posts.results.map(post => (
          <Link key={post.uid} href={`post/${post.uid}`}>
            <a key={post.uid} className={styles.content}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div className={commonStyles.group}>
                <time>
                  {' '}
                  <span>
                    <AiOutlineCalendar />
                  </span>{' '}
                  {format(new Date(post.first_publication_date), 'd MMM yyy', {
                    locale: ptBR,
                  })}
                </time>
                <p>
                  {' '}
                  <span>
                    <AiOutlineUser />
                  </span>{' '}
                  {post.data.author}
                </p>
              </div>
            </a>
          </Link>
        ))}
        {posts.next_page && (
          <button type="button" onClick={handleLoadMorePosts}>
            Carregar mais posts
          </button>
        )}
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  return {
    props: {
      postsPagination: postsResponse,
    },
  };
};
