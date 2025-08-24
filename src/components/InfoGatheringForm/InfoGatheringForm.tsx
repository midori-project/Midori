"use client";

import React, { useState } from "react";
import { useInfoGatheringFlow } from "@/hooks/inforGath";
import { Button } from "@/components/Button/Button";

interface InfoGatheringFormProps {
  onComplete?: (result: any) => void;
}

export const InfoGatheringForm: React.FC<InfoGatheringFormProps> = ({
  onComplete,
}) => {
  const [prompt, setPrompt] = useState("");
  const {
    currentPhase,
    analysis,
    quality,
    finalOutput,
    isAnalyzing,
    isAssessingQuality,
    isGeneratingFinal,
    isLoading,
    error,
    startAnalysis,
    assessQuality,
    generateFinalOutput,
    reset,
    clearError,
    questionnaire,
  } = useInfoGatheringFlow();
  console.log("🔍 [InfoGatheringForm] Analysis:", analysis);
  console.log("🔍 [InfoGatheringForm] Quality:", quality);
  console.log("🔍 [InfoGatheringForm] Final Output:", finalOutput);
  console.log("🔍 [InfoGatheringForm] Current Phase:", currentPhase);
  console.log("🔍 [InfoGatheringForm] Is Analyzing:", isAnalyzing);
  console.log("🔍 [InfoGatheringForm] Is Assessing Quality:", isAssessingQuality);
  console.log("🔍 [InfoGatheringForm] Is Generating Final:", isGeneratingFinal);
  console.log("🔍 [InfoGatheringForm] Is Loading:", isLoading);
  console.log("🔍 [InfoGatheringForm] Error:", error);

  const handleSubmitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      return;
    }

    await startAnalysis(prompt);
  };

  const handleAnswerQuestion = (questionId: string, answer: string) => {
    questionnaire.setAnswer(questionId, answer);
  };

  const handleNextQuestion = () => {
    if (
      questionnaire.currentQuestionIndex <
      questionnaire.questions.length - 1
    ) {
      questionnaire.nextQuestion();
    } else {
      // All questions answered, assess quality
      assessQuality();
    }
  };

  const handleGenerateFinal = async () => {
    await generateFinalOutput();
  };

  const handleReset = () => {
    reset();
    setPrompt("");
  };

  // Render different phases
  const renderInitialPhase = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">เริ่มต้นการสร้างเว็บไซต์</h2>
      <p className="text-gray-600">
        กรุณาอธิบายความต้องการของเว็บไซต์ที่คุณต้องการสร้าง
      </p>

      <form onSubmit={handleSubmitPrompt} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="เช่น ฉันต้องการเว็บไซต์ร้านค้าออนไลน์สำหรับขายเสื้อผ้า..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none"
          rows={4}
          disabled={isAnalyzing || isLoading}
        />

        <Button
          type="submit"
          disabled={!prompt.trim() || isAnalyzing || isLoading}
          className="w-full"
        >
          {isAnalyzing ? "กำลังวิเคราะห์..." : "เริ่มวิเคราะห์"}
        </Button>
      </form>
    </div>
  );

  const renderQuestionsPhase = () => {
    const currentQuestion = questionnaire.getCurrentQuestion();

    if (!currentQuestion) {
      return (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800">ไม่พบคำถาม</h3>
            <p className="text-yellow-700">กรุณาลองใหม่อีกครั้ง</p>
          </div>
        </div>
      );
    }

    const questionError = questionnaire.errors[currentQuestion.id];

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">คำถามเพิ่มเติม</h2>
        <p className="text-gray-600">
          กรุณาตอบคำถามเพื่อให้เราเข้าใจความต้องการของคุณมากขึ้น
        </p>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="mb-4">
            <span className="text-sm text-gray-500">
              คำถามที่ {questionnaire.currentQuestionIndex + 1} จาก{" "}
              {questionnaire.questions.length}
            </span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${questionnaire.getProgress()}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">
              {currentQuestion.question}
              {currentQuestion.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h3>

            {questionError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-red-700 text-sm">{questionError}</p>
              </div>
            )}

            {currentQuestion.options ? (
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      onChange={(e) =>
                        handleAnswerQuestion(currentQuestion.id, e.target.value)
                      }
                      checked={
                        questionnaire.answers[currentQuestion.id] === option
                      }
                      className="text-blue-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={questionnaire.answers[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleAnswerQuestion(currentQuestion.id, e.target.value)
                }
                placeholder="พิมพ์คำตอบของคุณ..."
                className={`w-full p-3 border rounded-lg ${
                  questionError ? "border-red-300" : "border-gray-300"
                }`}
              />
            )}

            <div className="flex space-x-2">
              {questionnaire.currentQuestionIndex > 0 && (
                <Button
                  onClick={questionnaire.previousQuestion}
                  variant="outline"
                  disabled={isLoading}
                >
                  ก่อนหน้า
                </Button>
              )}

              <Button
                onClick={handleNextQuestion}
                disabled={
                  !questionnaire.answers[currentQuestion.id] || isLoading
                }
                className="flex-1"
              >
                {questionnaire.currentQuestionIndex <
                questionnaire.questions.length - 1
                  ? "ถัดไป"
                  : "ประเมินคุณภาพ"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQualityPhase = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">ประเมินคุณภาพข้อมูล</h2>

      {quality && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">ความครบถ้วน</h3>
              <p className="text-2xl font-bold text-blue-600">
                {quality.completeness}%
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">ความชัดเจน</h3>
              <p className="text-2xl font-bold text-green-600">
                {quality.clarity}%
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">ความสอดคล้อง</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {quality.consistency}%
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">คะแนนรวม</h3>
              <p className="text-2xl font-bold text-purple-600">
                {quality.overallScore}%
              </p>
            </div>
          </div>

          {quality.recommendations.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">ข้อเสนอแนะ:</h3>
              <ul className="list-disc list-inside space-y-1">
                {quality.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            onClick={handleGenerateFinal}
            disabled={isGeneratingFinal || isLoading}
            className="w-full"
          >
            {isGeneratingFinal ? "กำลังสร้างผลลัพธ์..." : "สร้างผลลัพธ์สุดท้าย"}
          </Button>
        </div>
      )}
    </div>
  );

  const renderCompletePhase = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">เสร็จสิ้น!</h2>

      {finalOutput && (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">สรุปผลลัพธ์</h3>
            <p className="text-green-700">
              เว็บไซต์ของคุณพร้อมแล้ว! เราได้สร้างเว็บไซต์ตามความต้องการของคุณ
            </p>
          </div>

          {finalOutput.summary && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">ความต้องการ:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {finalOutput.summary.requirements.map((req, index) => (
                    <li key={index} className="text-gray-700">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">ข้อเสนอแนะ:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {finalOutput.summary.recommendations.map((rec, index) => (
                    <li key={index} className="text-blue-700">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800">
                    เวลาที่ประมาณการ
                  </h3>
                  <p className="text-yellow-700">
                    {finalOutput.summary.estimatedTime}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800">
                    ต้นทุนที่ประมาณการ
                  </h3>
                  <p className="text-red-700">
                    {finalOutput.summary.estimatedCost}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button onClick={handleReset} variant="outline">
              เริ่มใหม่
            </Button>
            <Button
              onClick={() => onComplete?.(finalOutput)}
              className="flex-1"
            >
              ดาวน์โหลดผลลัพธ์
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Loading state
  if (isLoading && !isAnalyzing && !isAssessingQuality && !isGeneratingFinal) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">กำลังประมวลผล...</h3>
          <p className="text-blue-700">กรุณารอสักครู่</p>
        </div>
      </div>
    );
  }

  // Error display
  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800">เกิดข้อผิดพลาด</h3>
          <p className="text-red-700">{error}</p>
          <div className="flex space-x-2 mt-3">
            <Button onClick={clearError} variant="outline">
              ลองใหม่
            </Button>
            <Button onClick={handleReset}>เริ่มต้นใหม่</Button>
          </div>
        </div>
      </div>
    );
  }

  // Render based on current phase
  switch (currentPhase) {
    case "initial":
      return renderInitialPhase();
    case "questions":
      return renderQuestionsPhase();
    case "quality":
      return renderQualityPhase();
    case "complete":
      return renderCompletePhase();
    default:
      return renderInitialPhase();
  }
};
