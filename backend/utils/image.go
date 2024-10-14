package utils

import (
	"bytes"
	"image"
	_ "image/gif"
	"image/jpeg"
	_ "image/png"

	"github.com/nfnt/resize"
)

func CreateThumbnailImage(buffer []byte, width uint, height uint) ([]byte, error) {
	img, _, err := image.Decode(bytes.NewReader(buffer))
	if err != nil {
		return nil, err
	}

	thumb := resize.Thumbnail(width, height, img, resize.NearestNeighbor)
	buf := new(bytes.Buffer)
	if err := jpeg.Encode(buf, thumb, nil); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
