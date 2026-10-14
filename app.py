
import streamlit as st

st.set_page_config(
    page_title="AI Content Generator",
    page_icon="✍️",
    layout="centered"
)

st.title("✍️ AI Content Generator")
st.write("Create blog articles and social media content easily.")

# User inputs
content_type = st.selectbox(
    "Choose content type",
    ["Blog Post", "Instagram Caption", "LinkedIn Post", "Facebook Post"]
)

topic = st.text_input(
    "Enter your topic",
    placeholder="Example: Benefits of Artificial Intelligence"
)

audience = st.text_input(
    "Target audience",
    placeholder="Example: Students, business owners"
)

tone = st.selectbox(
    "Choose writing tone",
    ["Professional", "Friendly", "Creative", "Informative", "Casual"]
)

length = st.selectbox(
    "Choose content length",
    ["Short", "Medium", "Long"]
)

# Generate content
if st.button("Generate Content", type="primary"):

    if not topic.strip():
        st.warning("Please enter a topic first.")

    else:
        if content_type == "Blog Post":
            heading = f"Blog: {topic}"
            body = f"""
# {topic}

## Introduction
{topic} is an important topic for today's audience.

## Key Points
- Understand the basics of {topic}.
- Explore its benefits and practical uses.
- Learn how it can help {audience or "readers"}.

## Conclusion
Understanding {topic} can help readers make
better-informed decisions.
"""
        elif content_type == "Instagram Caption":
            heading = f"Instagram: {topic}"
            body = (
                f"✨ Let's talk about {topic}!\n\n"
                f"Discover something new and useful today.\n\n"
                f"What do you think about this? Share below! 👇\n\n"
                f"#ContentCreation #{topic.replace(' ', '')}"
            )
        elif content_type == "LinkedIn Post":
            heading = f"LinkedIn: {topic}"
            body = (
                f"Let's explore {topic}.\n\n"
                f"Understanding this topic can help "
                f"{audience or 'professionals'} grow and learn.\n\n"
                f"What are your thoughts on {topic}?"
            )
        else:
            heading = f"Facebook: {topic}"
            body = (
                f"Have you explored {topic} yet?\n\n"
                f"Here are some ideas worth learning about. "
                f"Share your thoughts and join the conversation!"
            )

        st.subheader(heading)
        st.write(f"**Tone:** {tone} | **Length:** {length}")
        st.markdown(body)

        st.download_button(
            label="Download Content",
            data=body,
            file_name="generated_content.md",
            mime="text/markdown"
        )
