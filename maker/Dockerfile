FROM node:12-buster

RUN apt-get update && \
  apt-get install -y \
  g++ \
  make \
  cmake \
  unzip \
  libcurl4-openssl-dev

WORKDIR /task
COPY ./package.json /task/package.json
RUN npm install --production

WORKDIR /tmp
RUN git clone https://github.com/ImageMagick/ImageMagick.git im
WORKDIR /tmp/im
RUN git checkout 7.0.11-4
RUN ./configure \
  --prefix=/usr/local/imagemagick \
  --enable-shared=no \
  --enable-static=yes \
  --disable-installed \
  --disable-openmp \
  --with-bzlib=no \
  --with-autotrace=no \
  --with-djvu=no \
  --with-dps=no \
  --with-fpx=no \
  --with-fontconfig=no \
  --with-freetype=no \
  --with-gs-font-dir=default \
  --with-gslib=no \
  --with-gvc=no \
  --with-jbig=no \
  --with-jpeg=no \
  --with-jp2=no \
  --with-lcms=yesno \
  --with-lqr=no \
  --with-lzma=no \
  --with-magick-plus-plus=no \
  --with-openexr=no \
  --with-openjp2=no \
  --with-perl=no \
  --with-png=yes \
  --with-rsvg=no \
  --with-tiff=no \
  --with-webp=no \
  --with-wmf=no \
  --with-x=no \
  --with-xml=no \
  --with-zlib=no
RUN make

RUN make install

#-------------

FROM node:12-buster-slim

COPY --from=0 /usr/local/imagemagick /usr/local/imagemagick
COPY --from=0 /usr/local/lib /usr/local/lib
COPY --from=0 /usr/lib/x86_64-linux-gnu/libpng* /usr/lib/x86_64-linux-gnu/

RUN mv /usr/local/imagemagick/bin/* /usr/local/bin/

WORKDIR /task
COPY --from=0 /task /task

COPY ./index.js /task/index.js
COPY ./parts /task/parts

ENTRYPOINT ["/task/node_modules/.bin/aws-lambda-ric"]
CMD ["index.charlie"]