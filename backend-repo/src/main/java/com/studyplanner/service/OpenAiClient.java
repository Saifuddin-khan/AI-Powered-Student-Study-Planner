package com.studyplanner.service;

public interface OpenAiClient {

    /**
     * Sends a chat completion request in JSON mode (response_format=json_object)
     * and returns the raw JSON string produced by the model.
     */
    String completeJson(String systemPrompt, String userPrompt, int maxTokens);
}
