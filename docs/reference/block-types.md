# 13개 블록 타입

PromptBlocks의 13개 블록 타입에 대한 상세 설명입니다.

## 블록 타입 목록

| 블록 타입              | 한글명           | 주요 용도          |
| ---------------------- | ---------------- | ------------------ |
| subject_type           | 주제 유형        | 피사체 정의        |
| style                  | 스타일           | 시각적 스타일      |
| appearance             | 인물 외형        | 외모 특징          |
| outfit                 | 의상             | 옷과 액세서리      |
| pose_expression        | 포즈/표정        | 자세와 감정        |
| props_objects          | 소품/오브젝트    | 함께 등장하는 물건 |
| background_environment | 배경/환경        | 장소와 분위기      |
| lighting               | 조명             | 빛의 종류와 방향   |
| camera_lens            | 칩처/렌즈        | 촬영 기법          |
| color_mood             | 색감/분위기      | 전체적인 톤        |
| text_in_image          | 이미지 내 텍스트 | 포함된 글자        |
| composition            | 구도             | 화면 배치          |
| tech_params            | 기술 파라미터    | 해상도, 비율 등    |

---

## 상세 설명

### 1. 주제 유형 (Subject Type)

**영어**: Subject Type  
**설명**: 이미지의 주요 피사체 유형  
**예시**:

- portrait of a woman
- landscape scenery
- product photography
- cute puppy
- futuristic robot

**사용팁**: 가장 기본이 되는 블록입니다. 인물, 풍경, 제품 등 큰 카테고리를 정의합니다.

---

### 2. 스타일 (Style)

**영어**: Style  
**설명**: 이미지의 시각적 스타일과 예술적 접근  
**예시**:

- photorealistic
- anime style
- oil painting
- watercolor illustration
- 3D render

**사용팁**: 전체적인 느낌을 결정합니다. Midjourney의 --sref와 함께 사용하면 효과적입니다.

---

### 3. 인물 외형 (Appearance)

**영어**: Appearance  
**설명**: 인물의 외모적 특징  
**예시**:

- long black hair
- blue eyes
- freckles across cheeks
- muscular build
- elegant facial features

**사용팁**: 캐릭터 일관성 유지에 필수적인 블록입니다. 구체적일수록 좋습니다.

---

### 4. 의상 (Outfit)

**영어**: Outfit  
**설명**: 착용한 의상과 액세서리  
**예시**:

- white summer dress
- business suit with tie
- casual jeans and t-shirt
- traditional hanbok
- leather jacket

**사용팁**: 스타일 전환 시 이 블록만 변경하면 같은 인물에 다양한 룩을 줄 수 있습니다.

---

### 5. 포즈/표정 (Pose/Expression)

**영어**: Pose/Expression  
**설명**: 자세와 감정 표현  
**예시**:

- sitting on a bench
- smiling warmly
- looking over shoulder
- arms crossed
- surprised expression

**사용팁**: 캐릭터의 성격과 상황을 전달합니다. 동적인 포즈는 생동감을 줍니다.

---

### 6. 소품/오브젝트 (Props/Objects)

**영어**: Props/Objects  
**설명**: 함께 등장하는 소품과 오브젝트  
**예시**:

- holding a book
- vintage camera on table
- cup of coffee
- bouquet of flowers
- laptop computer

**사용팁**: 스토리텔링에 중요합니다. 무작위 조합 시 재미있는 조합이 나옵니다.

---

### 7. 배경/환경 (Background/Environment)

**영어**: Background/Environment  
**설명**: 배경 환경 설정  
**예시**:

- cozy coffee shop interior
- busy city street
- serene mountain lake
- abstract gradient background
- bokeh lights

**사용팁**: 전체적인 분위기를 좌우합니다. 인물 블록과 조합해 다양한 상황 연출.

---

### 8. 조명 (Lighting)

**영어**: Lighting  
**설명**: 조명 설정과 빛의 특성  
**예시**:

- golden hour sunlight
- soft studio lighting
- dramatic side light
- neon light reflection
- natural window light

**사용팁**: 분위기 결정의 핵심입니다. Rembrandt lighting, butterfly lighting 등 전문 용어 활용.

---

### 9. 칩처/렌즈 (Camera/Lens)

**영어**: Camera/Lens  
**설명**: 촬영 기법과 장비 설정  
**예시**:

- 85mm lens portrait
- wide angle shot
- shallow depth of field
- macro photography
- drone aerial view

**사용팁**: 전문적인 느낌을 줍니다. focal length와 aperture 명시 시 효과적.

---

### 10. 색감/분위기 (Color/Mood)

**영어**: Color/Mood  
**설명**: 색감과 전체적인 분위기  
**예시**:

- warm earthy tones
- cool blue palette
- vibrant saturated colors
- muted pastel shades
- cinematic color grading

**사용팁**: 색온도와 채도를 조절합니다. warm/cool contrast 활용.

---

### 11. 이미지 내 텍스트 (Text in Image)

**영어**: Text in Image  
**설명**: 이미지에 포함될 텍스트나 타이포그래피  
**예시**:

- neon sign "OPEN"
- handwritten letter
- vintage poster text
- graffiti on wall
- book title on cover

**사용팁**: 주의해서 사용하세요. AI 텍스트 생성은 아직 불완전할 수 있습니다.

---

### 12. 구도 (Composition)

**영어**: Composition  
**설명**: 화면 구도와 배치  
**예시**:

- rule of thirds
- centered composition
- leading lines
- symmetry
- frame within frame

**사용팁**: 시각적 균형을 잡습니다. 전통적인 구도법 용어 활용.

---

### 13. 기술 파라미터 (Tech Params)

**영어**: Technical Parameters  
**설명**: 기술적 설정과 출력 옵션  
**예시**:

- 8k resolution
- highly detailed
- octane render
- unreal engine 5
- sharp focus

**사용팁**: 최종 품질에 영향을 줍니다. Midjourney의 --q, --hd 등과 유사한 역할.

---

## 블록 조합 예시

### 인물 초상화

```
subject_type: portrait of a young woman
appearance: long wavy brown hair, green eyes, natural makeup
outfit: white blouse
pose_expression: gentle smile, looking at camera
lighting: soft natural window light
camera_lens: 85mm lens, shallow depth of field
color_mood: warm tones, soft focus
```

### 풍경 사진

```
subject_type: landscape photography
background_environment: mountain valley with river
lighting: golden hour sunset
camera_lens: wide angle, 24mm
composition: rule of thirds, leading lines
color_mood: warm orange and purple sky
```

## 다음 단계

- [작가 스타일 목록](./artist-styles.md)
- [용어집](./glossary.md)
