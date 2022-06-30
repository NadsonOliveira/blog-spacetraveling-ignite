import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import {
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineUser,
} from 'react-icons/ai';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const amountWordsOfBody = RichText.asText(
    post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
  ).split(' ').length;

  const amountWordsOfHeading = post.data.content.reduce((acc, data) => {
    if (data.heading) {
      return [...acc, ...data.heading.split(' ')];
    }

    return [...acc];
  }, []).length;

  const readingTime = Math.ceil(
    (amountWordsOfBody + amountWordsOfHeading) / 200
  );

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div>
          <img src={post.data.banner.url} alt="banner" />

          <h1>{post.data.title}</h1>
          <section className={commonStyles.group}>
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

            <p>
              <span>
                <AiOutlineClockCircle />
              </span>
              {`${readingTime} min`}
            </p>
          </section>

          <section className={styles.content}>
            {post.data.content.map(content => (
              <div key={content.heading}>
                <h1>{content.heading}</h1>
                {content.body.map(bodyContent => (
                  <div
                    key={bodyContent.text}
                    dangerouslySetInnerHTML={{ __html: bodyContent.text }}
                    className={styles.bodyContent}
                  />
                ))}
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', slug as string, {});

  return {
    props: {
      post: response,
    },
  };
};
